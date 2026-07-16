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

function injectStaticPublishHead(html: string, publishedAt: string) {
  const head = `
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<!-- lacarte-published-at: ${publishedAt} -->
<style>
  /* Static wine accordion (no React hydration on FTP host) */
  .wine-accordion-panel-radix[data-state="closed"],
  .wine-accordion-panel-radix[hidden] {
    display: none !important;
    height: auto !important;
    animation: none !important;
  }
  .wine-accordion-panel-radix[data-state="open"] {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
    animation: none !important;
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
  document.querySelectorAll('[aria-label="Lingua menu"] a').forEach(function (a) {
    var label = (a.textContent || "").trim().toUpperCase();
    if (label === "IT") a.setAttribute("href", "./index.html");
    if (label === "EN") a.setAttribute("href", "./en.html");
    if ((label === "IT" && "${current}" === "it") || (label === "EN" && "${current}" === "en")) {
      a.classList.add("text-white");
      a.classList.remove("text-white/50");
    }
  });

  var sections = Array.prototype.slice.call(
    document.querySelectorAll(".wine-accordion-section")
  );
  if (!sections.length) return;

  function setOpen(section, open) {
    var btn = section.querySelector("button[aria-expanded]");
    var panel = section.querySelector(".wine-accordion-panel-radix");
    if (!btn || !panel) return;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("data-state", open ? "open" : "closed");
    if (open) {
      panel.removeAttribute("hidden");
    } else {
      panel.setAttribute("hidden", "");
    }
  }

  sections.forEach(function (section) {
    setOpen(section, false);
    var btn = section.querySelector("button[aria-expanded]");
    if (!btn) return;
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var willOpen = btn.getAttribute("aria-expanded") !== "true";
      sections.forEach(function (other) {
        setOpen(other, false);
      });
      if (!willOpen) return;
      setOpen(section, true);
      try {
        var top = section.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "smooth" });
      } catch (e) {
        section.scrollIntoView(true);
      }
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

const NO_CACHE_HTACCESS = `# Generated by La Carte — force fresh HTML after every publish
<IfModule mod_headers.c>
  <FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </FilesMatch>
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>
`;

export async function generateStaticMenuFiles(input: {
  menuSlug: string;
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
  const itUrl = `${internalBase}/menu/${input.menuSlug}?preview=true&embed=1&ftp=1`;
  const enUrl = `${internalBase}/menu/${input.menuSlug}?preview=true&embed=1&ftp=1&lang=en`;

  const [itHtml, enHtml] = await Promise.all([
    captureLocaleHtml(itUrl, assetBase, publicHost),
    captureLocaleHtml(enUrl, assetBase, publicHost),
  ]);

  const finalize = (html: string, locale: "it" | "en") =>
    Buffer.from(
      injectStaticBehaviors(
        injectStaticPublishHead(html, publishedAt),
        locale
      ),
      "utf8"
    );

  return [
    {
      remotePath: "index.html",
      content: finalize(itHtml, "it"),
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: "en.html",
      content: finalize(enHtml, "en"),
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: ".htaccess",
      content: Buffer.from(NO_CACHE_HTACCESS, "utf8"),
      contentType: "text/plain",
    },
  ];
}
