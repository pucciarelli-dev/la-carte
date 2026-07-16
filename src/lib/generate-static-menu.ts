import type { FtpPublishSettings } from "@/lib/ftp-settings";

export type StaticMenuFile = {
  remotePath: string;
  content: Buffer;
  contentType: string;
};

function publicAssetBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    process.env.AUTH_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}

/** Hit the local Next server during publish (avoids public DNS / TLS loops). */
function internalAppBaseUrl() {
  const port = process.env.PORT || "3000";
  return `http://127.0.0.1:${port}`;
}

function absolutizeHtml(html: string, assetBaseUrl: string) {
  let next = html;

  next = next.replace(
    /(href|src|poster)=["'](\/(?!\/)[^"']+)["']/g,
    (_match, attr: string, path: string) => `${attr}="${assetBaseUrl}${path}"`
  );

  next = next.replace(
    /url\((['"]?)(\/(?!\/)[^'")]+)\1\)/g,
    (_match, quote: string, path: string) =>
      `url(${quote}${assetBaseUrl}${path}${quote})`
  );

  // Drop Next.js client runtime — static host has no hydration.
  next = next.replace(
    /<script\b[^>]*src=["'][^"']*\/_next\/[^"']+["'][^>]*>\s*<\/script>/gi,
    ""
  );
  next = next.replace(
    /<script\b[^>]*>\s*self\.__next_f[\s\S]*?<\/script>/gi,
    ""
  );
  next = next.replace(
    /<script\b[^>]*>[\s\S]*?__NEXT_DATA__[\s\S]*?<\/script>/gi,
    ""
  );

  // Let the host site (WordPress) keep its own favicon.
  next = next.replace(
    /<link\b[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/gi,
    ""
  );
  next = next.replace(
    /<link\b[^>]*href=["'][^"']*\/(?:favicon\.ico|icon(?:-\d+x\d+)?\.(?:svg|png|ico)|apple-icon[^"']*)[^"']*["'][^>]*>/gi,
    ""
  );

  return next;
}

function injectStaticPublishHead(html: string, publishedAt: string, publishId: string) {
  const head = `
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<meta name="lacarte-publish-id" content="${publishId}" />
<!-- lacarte-published-at: ${publishedAt} -->
<style>
  /* Match preview Radix wine accordion motion on static FTP pages */
  .wine-accordion-panel-radix {
    overflow: hidden;
  }
  .wine-accordion-panel-radix[data-state="closed"] {
    height: 0 !important;
    visibility: hidden;
  }
  .wine-accordion-panel-radix[data-state="open"] {
    visibility: visible;
  }
  @media (prefers-reduced-motion: reduce) {
    .wine-accordion-panel-radix {
      transition: none !important;
    }
  }
</style>
`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}\n${head}`);
  }
  return `${head}${html}`;
}

function injectStaticBehaviors(
  html: string,
  current: "it" | "en",
  publishId: string
) {
  const script = `
<script>
(function () {
  var v = ${JSON.stringify(publishId)};
  var DURATION_MS = 600;
  var EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('[aria-label="Lingua menu"] a').forEach(function (a) {
    var label = (a.textContent || "").trim().toUpperCase();
    if (label === "IT") a.setAttribute("href", "./menu.html?v=" + v + "&t=" + Date.now());
    if (label === "EN") a.setAttribute("href", "./en.html?v=" + v + "&t=" + Date.now());
    if ((label === "IT" && "${current}" === "it") || (label === "EN" && "${current}" === "en")) {
      a.classList.add("text-white");
      a.classList.remove("text-white/50");
    }
  });

  var sections = Array.prototype.slice.call(
    document.querySelectorAll(".wine-accordion-section")
  );
  if (!sections.length) return;

  function stickyOffset() {
    var offset = 12;
    document.querySelectorAll(".menu-print-chrome.sticky, header.sticky").forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.height > 0 && rect.top <= 1) {
        offset = Math.max(offset, rect.bottom);
      }
    });
    return offset;
  }

  function scrollSectionToTop(section, behavior) {
    var top = section.getBoundingClientRect().top + window.scrollY - stickyOffset();
    window.scrollTo({ top: Math.max(0, top), left: 0, behavior: behavior || "auto" });
  }

  function pinSectionDuringOpen(section) {
    if (reducedMotion) {
      scrollSectionToTop(section, "auto");
      return;
    }
    scrollSectionToTop(section, "smooth");
    var startedAt = performance.now();
    function tick() {
      if (performance.now() - startedAt >= DURATION_MS) return;
      scrollSectionToTop(section, "auto");
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function panelHeight(panel) {
    panel.style.height = "auto";
    var h = panel.scrollHeight;
    return h;
  }

  function animateOpen(panel) {
    panel.removeAttribute("hidden");
    panel.setAttribute("data-state", "open");
    if (reducedMotion) {
      panel.style.height = "auto";
      panel.style.transition = "";
      return;
    }
    var h = panelHeight(panel);
    panel.style.height = "0px";
    panel.style.transition = "none";
    void panel.offsetHeight;
    panel.style.transition = "height " + DURATION_MS + "ms " + EASING;
    panel.style.height = h + "px";
    function onEnd(event) {
      if (event.propertyName && event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onEnd);
      panel.style.height = "auto";
      panel.style.transition = "";
    }
    panel.addEventListener("transitionend", onEnd);
  }

  function animateClose(panel, done) {
    if (panel.getAttribute("data-state") === "closed" && panel.style.height === "0px") {
      if (done) done();
      return;
    }
    panel.setAttribute("data-state", "closed");
    if (reducedMotion) {
      panel.style.height = "0px";
      panel.setAttribute("hidden", "");
      if (done) done();
      return;
    }
    var h = panelHeight(panel);
    panel.style.height = h + "px";
    panel.style.transition = "none";
    void panel.offsetHeight;
    panel.style.transition = "height " + DURATION_MS + "ms " + EASING;
    panel.style.height = "0px";
    function onEnd(event) {
      if (event.propertyName && event.propertyName !== "height") return;
      panel.removeEventListener("transitionend", onEnd);
      panel.setAttribute("hidden", "");
      panel.style.transition = "";
      if (done) done();
    }
    panel.addEventListener("transitionend", onEnd);
  }

  function setOpen(section, open, options) {
    options = options || {};
    var btn = section.querySelector("button[aria-expanded]");
    var panel = section.querySelector(".wine-accordion-panel-radix");
    if (!btn || !panel) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      animateOpen(panel);
      if (options.scroll) pinSectionDuringOpen(section);
    } else {
      animateClose(panel);
    }
  }

  sections.forEach(function (section) {
    var panel = section.querySelector(".wine-accordion-panel-radix");
    var btn = section.querySelector("button[aria-expanded]");
    if (panel) {
      panel.style.height = "0px";
      panel.setAttribute("data-state", "closed");
      panel.setAttribute("hidden", "");
    }
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (!btn) return;

    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var willOpen = btn.getAttribute("aria-expanded") !== "true";
      sections.forEach(function (other) {
        if (other === section) return;
        setOpen(other, false);
      });
      setOpen(section, willOpen, { scroll: willOpen });
    });
  });
})();
</script>`;
  return html.replace(/<\/body>/i, `${script}</body>`);
}

async function captureLocaleHtml(
  pageUrl: string,
  assetBaseUrl: string,
  publicHost: string
): Promise<string> {
  const bust = `${pageUrl}${pageUrl.includes("?") ? "&" : "?"}_=${Date.now()}`;
  const response = await fetch(bust, {
    headers: {
      Accept: "text/html",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "x-forwarded-host": publicHost,
      "x-tenant-host": publicHost,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Pagina menu non disponibile (${response.status}) su ${pageUrl}`
    );
  }

  const html = await response.text();
  if (html.length < 200) {
    throw new Error(`HTML menu vuoto o non valido da ${pageUrl}`);
  }

  return absolutizeHtml(html, assetBaseUrl);
}

function buildRedirectStub(publishId: string) {
  // Served as DirectoryIndex for /menu-dinner/ — works when Apache rewrite does not.
  // t=Date.now() forces Safari to skip cached menu.html.
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <meta name="lacarte-publish-id" content="${publishId}" />
  <meta http-equiv="refresh" content="0;url=menu.html?v=${publishId}" />
  <title>Menu</title>
  <script>
    (function () {
      var v = ${JSON.stringify(publishId)};
      var target = "./menu.html?v=" + encodeURIComponent(v) + "&t=" + Date.now();
      window.location.replace(target);
    })();
  </script>
</head>
<body>
  <p><a href="./menu.html?v=${publishId}">Apri il menu</a></p>
</body>
</html>
`;
}

function buildRedirectPhp(publishId: string) {
  // PHP is usually not cached by Aruba the same way as static directory HTML.
  return `<?php
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
$v = @file_get_contents(__DIR__ . '/version.txt');
$v = $v !== false ? trim($v) : ${JSON.stringify(publishId)};
if ($v === '') { $v = ${JSON.stringify(publishId)}; }
header('Location: menu.html?v=' . rawurlencode($v) . '&t=' . time(), true, 302);
exit;
`;
}

function buildNoCacheHtaccess(publishId: string) {
  return `# Generated by La Carte — publish ${publishId}
# Prefer PHP redirect (bypasses Safari/Aruba directory HTML cache).
DirectoryIndex redirect.php index.html
FileETag None
<IfModule mod_headers.c>
  Header unset ETag
  Header always set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
  Header always set Pragma "no-cache"
  Header always set Expires "0"
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/plain "access plus 0 seconds"
</IfModule>
<FilesMatch "^(version\\.txt|redirect\\.php)$">
  <IfModule mod_headers.c>
    Header set Cache-Control "no-store, no-cache, must-revalidate, max-age=0"
  </IfModule>
</FilesMatch>
`;
}

export async function generateStaticMenuFiles(input: {
  menuSlug: string;
  publishPath: string;
  ftp: FtpPublishSettings;
}): Promise<StaticMenuFile[]> {
  void input.ftp;
  void input.publishPath;
  const internalBase = internalAppBaseUrl();
  const assetBase = publicAssetBaseUrl();
  let publicHost = "localhost";
  try {
    publicHost = new URL(assetBase).host;
  } catch {
    publicHost = "localhost";
  }

  const publishedAt = new Date().toISOString();
  const publishId = String(Date.now());
  const itUrl = `${internalBase}/menu/${input.menuSlug}?preview=true&embed=1&ftp=1`;
  const enUrl = `${internalBase}/menu/${input.menuSlug}?preview=true&embed=1&ftp=1&lang=en`;

  const [itHtml, enHtml] = await Promise.all([
    captureLocaleHtml(itUrl, assetBase, publicHost),
    captureLocaleHtml(enUrl, assetBase, publicHost),
  ]);

  const finalize = (html: string, locale: "it" | "en") =>
    Buffer.from(
      injectStaticBehaviors(
        injectStaticPublishHead(html, publishedAt, publishId),
        locale,
        publishId
      ),
      "utf8"
    );

  return [
    {
      remotePath: "redirect.php",
      content: Buffer.from(buildRedirectPhp(publishId), "utf8"),
      contentType: "application/x-httpd-php",
    },
    {
      remotePath: "index.html",
      content: Buffer.from(buildRedirectStub(publishId), "utf8"),
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: "menu.html",
      content: finalize(itHtml, "it"),
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: "en.html",
      content: finalize(enHtml, "en"),
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: "version.txt",
      content: Buffer.from(`${publishId}\n`, "utf8"),
      contentType: "text/plain; charset=utf-8",
    },
    {
      remotePath: ".htaccess",
      content: Buffer.from(buildNoCacheHtaccess(publishId), "utf8"),
      contentType: "text/plain",
    },
  ];
}
