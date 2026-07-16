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
  /* Same keyframes as preview (globals.css) — local so FTP pages don't depend on timing */
  @keyframes wine-accordion-slideDown {
    from { height: 0; }
    to { height: var(--radix-accordion-content-height); }
  }
  @keyframes wine-accordion-slideUp {
    from { height: var(--radix-accordion-content-height); }
    to { height: 0; }
  }
  .wine-accordion-panel-radix {
    overflow: hidden;
  }
  .wine-accordion-panel-radix[data-state="open"] {
    animation-name: wine-accordion-slideDown;
    animation-duration: 600ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  .wine-accordion-panel-radix[data-state="closed"] {
    animation-name: wine-accordion-slideUp;
    animation-duration: 600ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  }
  .wine-accordion-panel-radix[data-state="closed"]:not(.wine-accordion-animating) {
    height: 0;
    animation: none;
  }
  .wine-accordion-panel-radix[data-state="open"]:not(.wine-accordion-animating) {
    height: auto;
    animation: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .wine-accordion-panel-radix[data-state="open"],
    .wine-accordion-panel-radix[data-state="closed"] {
      animation: none !important;
    }
  }
</style>
`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}\n${head}`);
  }
  return `${head}${html}`;
}

function injectStaticBehaviors(html: string, current: "it" | "en") {
  const script = `
<script>
(function () {
  var DURATION_MS = 600;
  var reducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll('[aria-label="Lingua menu"] a').forEach(function (a) {
    var label = (a.textContent || "").trim().toUpperCase();
    // Always use PHP entrypoints — Aruba caches bare /menu-*/ directories
    if (label === "IT") a.setAttribute("href", "./index.php");
    if (label === "EN") a.setAttribute("href", "./en.php");
    if ((label === "IT" && "${current}" === "it") || (label === "EN" && "${current}" === "en")) {
      a.classList.add("text-white");
      a.classList.remove("text-white/50");
    }
  });

  // Lock onto PHP URLs — Aruba caches bare /menu-*/ directories (Safari HIT)
  (function canonicalPhpUrl() {
    var path = location.pathname;
    var file = path.split("/").pop() || "";
    if (file === "index.php" || file === "en.php") return;
    var dir = path.replace(/\/[^\/]*$/, "/");
    if (!/\.[a-z0-9]+$/i.test(file)) {
      dir = path.replace(/\/?$/, "/");
    }
    if (file === "en.html" || file === "en") {
      location.replace(dir + "en.php");
      return;
    }
    location.replace(dir + "index.php");
  })();

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

  function measureContentHeight(panel) {
    var wasHidden = panel.hasAttribute("hidden");
    var prevHeight = panel.style.height;
    var prevVisibility = panel.style.visibility;
    var prevOverflow = panel.style.overflow;
    if (wasHidden) panel.removeAttribute("hidden");
    panel.style.visibility = "hidden";
    panel.style.overflow = "hidden";
    panel.style.height = "auto";
    var height = panel.scrollHeight;
    panel.style.height = prevHeight;
    panel.style.visibility = prevVisibility;
    panel.style.overflow = prevOverflow;
    if (wasHidden) panel.setAttribute("hidden", "");
    return height;
  }

  function clearAnim(panel) {
    panel.classList.remove("wine-accordion-animating");
    panel.style.removeProperty("--radix-accordion-content-height");
    panel.style.removeProperty("animation");
  }

  function animateOpen(panel) {
    if (panel.getAttribute("data-state") === "open" && !panel.classList.contains("wine-accordion-animating")) {
      return;
    }
    clearAnim(panel);
    var height = measureContentHeight(panel);
    panel.style.setProperty("--radix-accordion-content-height", height + "px");
    panel.removeAttribute("hidden");
    panel.classList.add("wine-accordion-animating");
    panel.setAttribute("data-state", "open");

    if (reducedMotion) {
      clearAnim(panel);
      panel.style.height = "auto";
      return;
    }

    function onEnd(event) {
      if (event.target !== panel) return;
      if (event.animationName && event.animationName.indexOf("slideDown") === -1 && event.propertyName && event.propertyName !== "height") {
        return;
      }
      panel.removeEventListener("animationend", onEnd);
      panel.removeEventListener("transitionend", onEnd);
      clearAnim(panel);
      panel.style.height = "auto";
    }
    panel.addEventListener("animationend", onEnd);
    panel.addEventListener("transitionend", onEnd);
    window.setTimeout(function () {
      if (!panel.classList.contains("wine-accordion-animating")) return;
      clearAnim(panel);
      panel.style.height = "auto";
    }, DURATION_MS + 50);
  }

  function animateClose(panel) {
    if (panel.getAttribute("data-state") === "closed" && !panel.classList.contains("wine-accordion-animating")) {
      return;
    }
    clearAnim(panel);
    var height = panel.scrollHeight || measureContentHeight(panel);
    panel.style.setProperty("--radix-accordion-content-height", height + "px");
    panel.style.height = height + "px";
    panel.removeAttribute("hidden");
    panel.classList.add("wine-accordion-animating");
    // Force reflow so slideUp starts from full height
    void panel.offsetHeight;
    panel.setAttribute("data-state", "closed");

    if (reducedMotion) {
      clearAnim(panel);
      panel.style.height = "0px";
      panel.setAttribute("hidden", "");
      return;
    }

    function onEnd(event) {
      if (event.target !== panel) return;
      if (event.animationName && event.animationName.indexOf("slideUp") === -1 && event.propertyName && event.propertyName !== "height") {
        return;
      }
      panel.removeEventListener("animationend", onEnd);
      panel.removeEventListener("transitionend", onEnd);
      clearAnim(panel);
      panel.style.height = "0px";
      panel.setAttribute("hidden", "");
    }
    panel.addEventListener("animationend", onEnd);
    panel.addEventListener("transitionend", onEnd);
    window.setTimeout(function () {
      if (!panel.classList.contains("wine-accordion-animating")) return;
      clearAnim(panel);
      panel.style.height = "0px";
      panel.setAttribute("hidden", "");
    }, DURATION_MS + 50);
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
      clearAnim(panel);
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
      // Close others in parallel (same as Radix single accordion)
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

function buildServePhp(contentFile: string) {
  // Keeps content fresh: PHP responses are not kept in Aruba directory HTML HIT cache.
  return `<?php
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0, private');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noarchive');
$file = __DIR__ . '/' . ${JSON.stringify(contentFile)};
if (!is_file($file)) {
  http_response_code(404);
  echo 'Menu non trovato';
  exit;
}
readfile($file);
exit;
`;
}

function buildNoCacheHtaccess(publishPath: string, publishId: string) {
  void publishPath;
  return `# Generated by La Carte — publish ${publishId}
# Only PHP — do NOT ship index.html (Aruba caches directory index HTML for Safari)
DirectoryIndex index.php
FileETag None
<IfModule mod_headers.c>
  Header unset ETag
  Header always set Cache-Control "no-store, no-cache, must-revalidate, max-age=0, private"
  Header always set Pragma "no-cache"
  Header always set Expires "0"
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
<IfModule mod_rewrite.c>
  RewriteEngine On
  # Directory URL → index.php (when origin is reached; bypasses stale Aruba HIT eventually)
  RewriteRule ^$ index.php [L]
  # Old bookmarked HTML URLs → PHP
  RewriteRule ^menu\\.html$ index.php [L]
  RewriteRule ^en\\.html$ en.php [L]
  RewriteRule ^index\\.html$ index.php [L]
</IfModule>
`;
}

export async function generateStaticMenuFiles(input: {
  menuSlug: string;
  publishPath: string;
  ftp: FtpPublishSettings;
}): Promise<StaticMenuFile[]> {
  void input.ftp;
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
  const publishPath = input.publishPath.replace(/^\/+|\/+$/g, "");
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
        locale
      ),
      "utf8"
    );

  const itContent = finalize(itHtml, "it");
  const enContent = finalize(enHtml, "en");

  return [
    {
      remotePath: "index.php",
      content: Buffer.from(buildServePhp("menu.html"), "utf8"),
      contentType: "application/x-httpd-php",
    },
    {
      remotePath: "en.php",
      content: Buffer.from(buildServePhp("en.html"), "utf8"),
      contentType: "application/x-httpd-php",
    },
    {
      remotePath: "menu.html",
      content: itContent,
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: "en.html",
      content: enContent,
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: "version.txt",
      content: Buffer.from(`${publishId}\n`, "utf8"),
      contentType: "text/plain; charset=utf-8",
    },
    {
      remotePath: ".htaccess",
      content: Buffer.from(
        buildNoCacheHtaccess(publishPath, publishId),
        "utf8"
      ),
      contentType: "text/plain",
    },
  ];
}
