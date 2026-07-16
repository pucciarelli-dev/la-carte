import { existsSync } from "fs";
import { chromium, type Browser, type Page } from "playwright";
import {
  MENU_PDF_WINE_PAGE_BREAK_CLASS,
  MENU_PDF_WINE_PAGE_BOTTOM_PAD_CLASS,
  MENU_PDF_WINE_PAGE_TOP_PAD_CLASS,
  WINE_PDF_SLOTS_PER_PAGE,
} from "@/lib/menu-print";

type BrowserEvaluator = () => void | Promise<void>;
type BrowserPredicate = () => boolean | Promise<boolean>;

function needsServerlessChromium() {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.USE_SPARTICUZ_CHROMIUM === "1"
  );
}

function systemChromiumPath(): string | undefined {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "/bin/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((value): value is string => Boolean(value));

  return candidates.find((candidate) => existsSync(candidate));
}

async function launchPdfBrowser(): Promise<Browser> {
  const commonArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
  ];

  if (!needsServerlessChromium()) {
    return chromium.launch({
      headless: true,
      args: commonArgs,
    });
  }

  // Prefer Nix/system Chromium on Railway (Playwright's bundled browser needs missing libs).
  const systemPath = systemChromiumPath();
  if (systemPath) {
    return chromium.launch({
      executablePath: systemPath,
      headless: true,
      args: commonArgs,
    });
  }

  const { default: sparticuzChromium } = await import("@sparticuz/chromium");
  // Setter API (not a method): disables WebGL / swiftshader extract on Railway.
  sparticuzChromium.setGraphicsMode = false;

  return chromium.launch({
    executablePath: await sparticuzChromium.executablePath(),
    headless: true,
    args: [...sparticuzChromium.args, ...commonArgs],
  });
}

function runInPage(page: Page, script: string, arg?: unknown) {
  const fn = new Function(
    "arg",
    `return (${script})(arg);`
  ) as (arg: unknown) => void | Promise<void>;

  return arg === undefined ? page.evaluate(fn as BrowserEvaluator) : page.evaluate(fn, arg);
}

function runInPageSync<T>(page: Page, script: string): Promise<T> {
  const fn = new Function(`return (${script})();`) as () => T;
  return page.evaluate(fn);
}

function waitInPage(page: Page, script: string, options?: { timeout?: number }) {
  const fn = new Function(`return (${script})();`) as BrowserPredicate;
  return page.waitForFunction(fn, options);
}

async function eagerLoadMenuImages(page: Page) {
  await runInPage(
    page,
    `async function() {
      const images = Array.from(document.querySelectorAll(".menu-pdf-root img"));
      await Promise.all(
        images.map(function(image) {
          return new Promise(function(resolve) {
            function done() { resolve(); }
            if (image.complete && image.naturalWidth > 0) {
              done();
              return;
            }
            image.loading = "eager";
            image.addEventListener("load", done, { once: true });
            image.addEventListener("error", done, { once: true });
            image.scrollIntoView({ block: "center" });
            const src = image.currentSrc || image.src;
            if (src) image.src = src;
          });
        })
      );
    }`
  );
}

async function waitForCoverVideo(page: Page) {
  const hasVideo = await page.locator(".menu-intro-cover-video-only").count();
  if (hasVideo === 0) return;

  await runInPage(
    page,
    `async function() {
      const video = document.querySelector(".menu-intro-cover-video-only");
      if (!video) return;
      video.preload = "auto";
      video.pause();
      if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
        await new Promise(function(resolve) {
          video.addEventListener("loadedmetadata", function() { resolve(); }, { once: true });
        });
      }
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        await new Promise(function(resolve) {
          video.addEventListener("loadeddata", function() { resolve(); }, { once: true });
        });
      }
    }`
  );

  await waitInPage(
    page,
    `function() {
      const video = document.querySelector(".menu-intro-cover-video-only");
      return Boolean(
        video &&
          video.readyState >= HTMLMediaElement.HAVE_METADATA &&
          video.videoWidth > 0 &&
          Number.isFinite(video.duration) &&
          video.duration > 0
      );
    }`
  );
}

async function waitForMenuAssets(page: Page) {
  await waitInPage(page, `function() { return document.fonts.ready; }`);
  await waitForCoverVideo(page);
  await eagerLoadMenuImages(page);

  await waitInPage(
    page,
    `function() {
      const images = Array.from(document.querySelectorAll(".menu-pdf-root img"));
      if (images.length === 0) return true;
      return images.every(function(image) {
        return image.complete && image.naturalWidth > 0;
      });
    }`
  );
}

async function seekCoverVideoToMiddle(page: Page) {
  await runInPage(
    page,
    `async function() {
      const video = document.querySelector(".menu-intro-cover-video-only");
      if (!video) return;
      const targetTime = video.duration / 2;
      await new Promise(function(resolve) {
        let settled = false;
        function finish() {
          if (settled) return;
          settled = true;
          resolve();
        }
        function onSeeked() {
          video.removeEventListener("seeked", onSeeked);
          finish();
        }
        video.addEventListener("seeked", onSeeked);
        video.pause();
        video.currentTime = targetTime;
        window.setTimeout(finish, 3000);
      });
      try {
        await video.play();
      } catch {}
      await new Promise(function(resolve) {
        if ("requestVideoFrameCallback" in video) {
          video.requestVideoFrameCallback(function() { resolve(); });
          window.setTimeout(resolve, 500);
          return;
        }
        window.setTimeout(resolve, 250);
      });
      video.pause();
    }`
  );
}

async function rasterizeCoverVideo(page: Page) {
  const video = page.locator(".menu-intro-cover-video-only");
  if ((await video.count()) === 0) return;

  await seekCoverVideoToMiddle(page);
  await page.waitForTimeout(150);

  const jpeg = await video.screenshot({
    type: "jpeg",
    quality: 92,
    animations: "disabled",
  });
  const dataUrl = `data:image/jpeg;base64,${jpeg.toString("base64")}`;

  await runInPage(
    page,
    `function(src) {
      const element = document.querySelector(".menu-intro-cover-video-only");
      if (!element) return;
      const image = document.createElement("img");
      image.src = src;
      image.alt = "";
      image.className = "menu-intro-cover-image block h-full w-full object-cover object-center";
      element.replaceWith(image);
    }`,
    dataUrl
  );
}

async function fitCategoryFooterImages(page: Page) {
  await runInPageSync(
    page,
    `function() {
      const pageHeightPx = (297 * 96) / 25.4;
      const maxImageHeightPx = (90 * 96) / 25.4;
      const minImageHeightPx = (12 * 96) / 25.4;

      document
        .querySelectorAll(".menu-pdf-root .menu-print-category-has-footer")
        .forEach(function(section) {
          const inner = section.querySelector(".menu-print-page-inner");
          const spacers = section.querySelectorAll(".menu-print-category-flex-spacer");
          const footer = section.querySelector(".menu-print-category-footer");
          const image = section.querySelector(".category-footer-image");
          if (!inner || !footer || !image) return;

          inner.style.boxSizing = "border-box";
          inner.style.display = "flex";
          inner.style.flexDirection = "column";
          inner.style.minHeight = "297mm";
          inner.style.height = "297mm";
          inner.style.maxHeight = "297mm";
          inner.style.overflow = "visible";

          spacers.forEach(function(spacer) {
            spacer.style.flex = "1 1 auto";
            spacer.style.minHeight = "0";
          });

          footer.style.flexShrink = "0";

          image.style.width = "100%";
          image.style.height = "auto";
          image.style.maxHeight = maxImageHeightPx + "px";
          image.style.marginTop = "0";
          image.style.objectFit = "contain";
          image.style.objectPosition = "bottom center";

          const budget = pageHeightPx;
          let maxHeight = maxImageHeightPx;
          for (let attempt = 0; attempt < 32; attempt += 1) {
            image.style.maxHeight = maxHeight + "px";
            const overflow = inner.scrollHeight - budget;
            if (overflow <= 1) break;
            const nextHeight = Math.max(minImageHeightPx, maxHeight - overflow);
            if (nextHeight >= maxHeight) break;
            maxHeight = nextHeight;
          }
        });
    }`
  );
}

async function paginateWineMenuForPdf(page: Page) {
  await runInPage(
    page,
    `function() {
      const itemsPerPage = ${WINE_PDF_SLOTS_PER_PAGE};
      const pageBreakClass = ${JSON.stringify(MENU_PDF_WINE_PAGE_BREAK_CLASS)};
      const sections = Array.from(
        document.querySelectorAll(".menu-pdf-root .wine-accordion-section")
      );

      if (sections.length === 0) return;

      let slotCount = 0;

      sections.forEach(function(section) {
        const title = section.querySelector(
          ".menu-print-category-content button[id^='wine-category-']"
        );
        const rows = Array.from(section.querySelectorAll(".mb-10"));

        if (title) {
          if (slotCount >= itemsPerPage) {
            title.classList.add(pageBreakClass);
            slotCount = 1;
          } else {
            slotCount += 1;
          }
        }

        rows.forEach(function(row, rowIndex) {
          if (slotCount >= itemsPerPage) {
            if (rowIndex === 0 && title && !title.classList.contains(pageBreakClass)) {
              title.classList.add(pageBreakClass);
              slotCount = 2;
            } else {
              row.classList.add(pageBreakClass);
              slotCount = 1;
            }
          } else {
            slotCount += 1;
          }
        });
      });
    }`
  );
}

async function padWineRowsAtPageBottom(page: Page) {
  await runInPage(
    page,
    `function() {
      const pageHeightPx = (297 * 96) / 25.4;
      const bottomPadClass = ${JSON.stringify(MENU_PDF_WINE_PAGE_BOTTOM_PAD_CLASS)};

      function pageIndex(top) {
        return Math.floor(top / pageHeightPx);
      }

      const rows = Array.from(
        document.querySelectorAll(".menu-pdf-root .wine-accordion-section .mb-10")
      );

      if (rows.length === 0) return;

      let maxPage = 0;
      rows.forEach(function(row) {
        const bottom = row.getBoundingClientRect().bottom + window.scrollY;
        maxPage = Math.max(maxPage, pageIndex(bottom));
      });

      for (let page = 0; page <= maxPage; page += 1) {
        const pageTop = page * pageHeightPx;
        const pageBottom = (page + 1) * pageHeightPx;
        let lastRow = null;
        let lastBottom = -1;

        rows.forEach(function(row) {
          const rect = row.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const bottom = rect.bottom + window.scrollY;
          if (bottom <= pageTop || top >= pageBottom) return;
          if (bottom > lastBottom) {
            lastBottom = bottom;
            lastRow = row;
          }
        });

        if (lastRow) {
          lastRow.classList.add(bottomPadClass);
        }
      }
    }`
  );
}

async function padWineRowsAtPageTop(page: Page) {
  await runInPage(
    page,
    `function() {
      const pageBreakClass = ${JSON.stringify(MENU_PDF_WINE_PAGE_BREAK_CLASS)};
      const topPadClass = ${JSON.stringify(MENU_PDF_WINE_PAGE_TOP_PAD_CLASS)};

      document
        .querySelectorAll(
          ".menu-pdf-root .wine-accordion-section .mb-10." + pageBreakClass
        )
        .forEach(function(row) {
          row.classList.add(topPadClass);
        });
    }`
  );
}

async function assertMenuPageReady(page: Page) {
  const ready = await runInPageSync<boolean>(
    page,
    `function() {
      return Boolean(document.querySelector(".menu-pdf-root"));
    }`
  );

  if (!ready) {
    throw new Error("Pagina menu non caricata correttamente");
  }
}

export async function generateMenuPdf(pageUrl: string): Promise<Buffer> {
  const browser = await launchPdfBrowser();

  try {
    const page = await browser.newPage();
    const response = await page.goto(pageUrl, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });

    if (!response || !response.ok()) {
      throw new Error(`Pagina menu non disponibile (${response?.status() ?? "nessuna risposta"})`);
    }

    await assertMenuPageReady(page);
    await waitForMenuAssets(page);
    await rasterizeCoverVideo(page);
    await page.emulateMedia({ media: "print" });
    await fitCategoryFooterImages(page);
    await paginateWineMenuForPdf(page);
    await padWineRowsAtPageBottom(page);
    await padWineRowsAtPageTop(page);
    await page.waitForTimeout(300);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    if (pdf.byteLength < 10_000) {
      throw new Error("PDF generato troppo piccolo, contenuto menu mancante");
    }

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
