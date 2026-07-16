import { chromium } from "playwright";
import type { FtpPublishSettings } from "@/lib/ftp-settings";

export type StaticMenuFile = {
  remotePath: string;
  content: Buffer;
  contentType: string;
};

function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
    process.env.AUTH_URL?.replace(/\/+$/, "") ||
    "http://localhost:3000"
  );
}

function absolutizeHtml(html: string, baseUrl: string) {
  let next = html;

  next = next.replace(
    /(href|src|poster)=["'](\/(?!\/)[^"']+)["']/g,
    (_match, attr: string, path: string) => `${attr}="${baseUrl}${path}"`
  );

  next = next.replace(
    /url\((['"]?)(\/(?!\/)[^'")]+)\1\)/g,
    (_match, quote: string, path: string) =>
      `url(${quote}${baseUrl}${path}${quote})`
  );

  next = next.replace(
    /<script\b[^>]*src=["'][^"']*\/_next\/[^"']+["'][^>]*>\s*<\/script>/gi,
    ""
  );
  next = next.replace(
    /<script\b[^>]*>\s*self\.__next_f[\s\S]*?<\/script>/gi,
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

async function captureLocaleHtml(pageUrl: string, baseUrl: string) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    const response = await page.goto(pageUrl, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Pagina menu non disponibile (${response?.status() ?? "nessuna risposta"})`
      );
    }

    await page.waitForSelector("main", { timeout: 30_000 });

    await page.evaluate(() => {
      document
        .querySelectorAll<HTMLElement>('button[data-state="closed"]')
        .forEach((button) => button.click());
    });
    await page.waitForTimeout(500);

    return absolutizeHtml(await page.content(), baseUrl);
  } finally {
    await browser.close();
  }
}

export async function generateStaticMenuFiles(input: {
  menuSlug: string;
  ftp: FtpPublishSettings;
}): Promise<StaticMenuFile[]> {
  void input.ftp;
  const baseUrl = appBaseUrl();
  const itUrl = `${baseUrl}/menu/${input.menuSlug}?ftp=1`;
  const enUrl = `${baseUrl}/menu/${input.menuSlug}?ftp=1&lang=en`;

  const [itHtml, enHtml] = await Promise.all([
    captureLocaleHtml(itUrl, baseUrl),
    captureLocaleHtml(enUrl, baseUrl),
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
