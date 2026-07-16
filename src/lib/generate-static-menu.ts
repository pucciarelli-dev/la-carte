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

function injectLanguageSwitcher(html: string, current: "it" | "en") {
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
})();
</script>`;
  return html.replace(/<\/body>/i, `${script}</body>`);
}

async function captureLocaleHtml(
  pageUrl: string,
  assetBaseUrl: string,
  publicHost: string
): Promise<string> {
  const response = await fetch(pageUrl, {
    headers: {
      Accept: "text/html",
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

  const itUrl = `${internalBase}/menu/${input.menuSlug}?preview=true&embed=1&ftp=1`;
  const enUrl = `${internalBase}/menu/${input.menuSlug}?preview=true&embed=1&ftp=1&lang=en`;

  const [itHtml, enHtml] = await Promise.all([
    captureLocaleHtml(itUrl, assetBase, publicHost),
    captureLocaleHtml(enUrl, assetBase, publicHost),
  ]);

  return [
    {
      remotePath: "index.html",
      content: Buffer.from(injectLanguageSwitcher(itHtml, "it"), "utf8"),
      contentType: "text/html; charset=utf-8",
    },
    {
      remotePath: "en.html",
      content: Buffer.from(injectLanguageSwitcher(enHtml, "en"), "utf8"),
      contentType: "text/html; charset=utf-8",
    },
  ];
}
