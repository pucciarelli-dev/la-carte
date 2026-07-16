import { chromium, type Browser } from "playwright";
import { execSync } from "child_process";
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

async function launchBrowser(): Promise<Browser> {
  try {
    return await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (firstError) {
    try {
      execSync("npx playwright install chromium", {
        stdio: "pipe",
        timeout: 180_000,
      });
      return await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } catch {
      const detail =
        firstError instanceof Error
          ? firstError.message
          : "Chromium non disponibile";
      throw new Error(
        `Impossibile avviare Chromium per la pubblicazione statica. (${detail})`
      );
    }
  }
}

async function captureLocaleHtml(
  browser: Browser,
  pageUrl: string,
  assetBaseUrl: string,
  publicHost: string
): Promise<string> {
  const page = await browser.newPage();
  try {
    await page.setExtraHTTPHeaders({
      "x-forwarded-host": publicHost,
      "x-tenant-host": publicHost,
    });

    const response = await page.goto(pageUrl, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Pagina menu non disponibile (${response?.status() ?? "nessuna risposta"}) su ${pageUrl}`
      );
    }

    await page.waitForSelector("main", { timeout: 30_000 });

    await page.evaluate(() => {
      document
        .querySelectorAll<HTMLElement>('button[data-state="closed"]')
        .forEach((button) => button.click());
    });
    await page.waitForTimeout(500);

    return absolutizeHtml(await page.content(), assetBaseUrl);
  } finally {
    await page.close();
  }
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

  const browser = await launchBrowser();
  try {
    // Sequential: Railway memory is limited; two Chromium instances often OOM.
    const itHtml = await captureLocaleHtml(
      browser,
      itUrl,
      assetBase,
      publicHost
    );
    const enHtml = await captureLocaleHtml(
      browser,
      enUrl,
      assetBase,
      publicHost
    );

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
  } finally {
    await browser.close();
  }
}
