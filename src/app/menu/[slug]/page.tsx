import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveTenantFromRequest } from "@/lib/tenant";
import {
  getPublishedMenuSnapshot,
  getMenuPreviewSnapshot,
  getPublishedMenusForTenant,
  getMenuBySlug,
} from "@/server/repositories/menu-repository";
import { MenuLayoutRenderer } from "@/components/public/menu-layout-renderer";
import { MenuGoogleFonts } from "@/components/public/menu-google-fonts";
import { MenuPublicActions } from "@/components/public/menu-public-actions";
import { MenuPreviewShell } from "@/components/public/menu-preview-shell";
import { MENU_PRINT_CHROME_CLASS, MENU_PRINT_ROOT_CLASS } from "@/lib/menu-print";
import { normalizeTypography } from "@/lib/google-fonts";
import { parseMenuIntro } from "@/lib/menu-intro";
import { parseMenuLocale, withMenuLocale } from "@/lib/locale";
import {
  categoryVisibleInLocale,
  localizeCategory,
  localizeIntro,
  resolveMenuSubtitle,
} from "@/lib/menu-localized";
import { DEFAULT_MENU_SUBTITLES } from "@/lib/layouts";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string; embed?: string; view?: string; lang?: string; pdf?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await resolveTenantFromRequest();
  if (!tenant) {
    return { title: "Menu" };
  }

  const menu = await getMenuBySlug(tenant.id, slug);
  const title = menu?.name ?? "Menu";

  return {
    title,
    description: `Consulta il ${title.toLowerCase()} del nostro ristorante.`,
    openGraph: { title },
  };
}

export default async function PublicMenuPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview, embed, lang, pdf } = await searchParams;

  const tenant = await resolveTenantFromRequest();
  if (!tenant) notFound();

  const menuExists = await getMenuBySlug(tenant.id, slug);
  if (!menuExists) notFound();

  const isPreview = preview === "true";
  const isEmbed = embed === "1" || embed === "true";
  const isPdfExport = pdf === "1";
  const locale = parseMenuLocale(lang);

  if (isPreview && !isEmbed && !isPdfExport) {
    return (
      <MenuPreviewShell
        slug={slug}
        src={withMenuLocale(`/menu/${slug}?preview=true&embed=1`, locale)}
      />
    );
  }
  const [snapshot, publishedMenus] = await Promise.all([
    isPreview
      ? getMenuPreviewSnapshot(tenant.id, slug)
      : getPublishedMenuSnapshot(tenant.id, slug),
    getPublishedMenusForTenant(tenant.id),
  ]);

  if (!snapshot) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {isPreview
            ? "Menu non trovato."
            : "Menu non ancora disponibile."}
        </p>
      </div>
    );
  }

  const visibleCategories = snapshot.categories
    .filter((c) => c.visible && categoryVisibleInLocale(c, locale))
    .map((category) => localizeCategory(category, locale));
  const isBistrotLayout = snapshot.layout.startsWith("BISTROT_");
  const typography = normalizeTypography(snapshot.typography);
  const parsedIntro = parseMenuIntro(snapshot.intro);
  const localizedIntro = localizeIntro(parsedIntro, locale);
  const localizedSubtitle =
    resolveMenuSubtitle(
      snapshot.subtitle ?? DEFAULT_MENU_SUBTITLES[snapshot.menuType],
      snapshot.subtitleEn,
      locale
    ) ?? DEFAULT_MENU_SUBTITLES[snapshot.menuType];
  const navMenus =
    publishedMenus.length > 0
      ? publishedMenus
      : [{ slug: snapshot.menuSlug, name: snapshot.menuName }];

  return (
    <div
      className={cn(
        "min-h-screen bg-white",
        isPdfExport && MENU_PRINT_ROOT_CLASS
      )}
    >
      <MenuGoogleFonts typography={typography} />
      {isPreview && !isEmbed && !isPdfExport && (
        <div
          className={cn(
            "bg-amber-50 px-4 py-2 text-center text-xs text-amber-800",
            MENU_PRINT_CHROME_CLASS
          )}
        >
          Anteprima — il contenuto non è ancora pubblicato
        </div>
      )}

      {!isBistrotLayout && (
        <header
          className={cn(
            "border-b",
            MENU_PRINT_CHROME_CLASS,
            isPreview &&
              !isPdfExport &&
              "sticky top-0 z-40 border-neutral-200/80 bg-white/95 backdrop-blur-sm"
          )}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-neutral-500">
                {tenant.name}
              </p>
              <h1 className="font-serif text-3xl">{snapshot.menuName}</h1>
            </div>
            <div className="flex items-center gap-3">
              {navMenus.length > 1 && (
                <nav className="hidden gap-4 text-base sm:flex">
                  {navMenus.map((menu) => (
                    <Link
                      key={menu.slug}
                      href={`/menu/${menu.slug}`}
                      className={
                        menu.slug === slug
                          ? "font-medium text-neutral-900"
                          : "text-neutral-500 hover:text-neutral-900"
                      }
                    >
                      {menu.name}
                    </Link>
                  ))}
                </nav>
              )}
              <MenuPublicActions
                slug={slug}
                showBackToEditor={isPreview && !isEmbed}
              />
            </div>
          </div>
        </header>
      )}

      <main
        className={
          isBistrotLayout
            ? cn("mx-auto bg-white px-4 sm:px-8", isPdfExport && "menu-pdf-main px-0")
            : "mx-auto max-w-3xl px-6 text-base"
        }
      >
        {isBistrotLayout && !isPdfExport && (
          <div className="menu-print-chrome menu-full-bleed relative left-1/2 flex w-screen max-w-[100vw] -translate-x-1/2 justify-end bg-black px-4 py-2 sm:px-8">
            <MenuPublicActions
              slug={slug}
              showBackToEditor={isPreview && !isEmbed}
            />
          </div>
        )}

        <MenuLayoutRenderer
          layout={snapshot.layout}
          categories={visibleCategories}
          branding={snapshot.branding}
          typography={typography}
          allergenLegend={snapshot.allergenLegend}
          coverImageUrl={snapshot.coverImageUrl}
          coverVideoUrl={snapshot.coverVideoUrl}
          intro={localizedIntro}
          subtitle={localizedSubtitle}
          menuName={snapshot.menuName}
          menuType={snapshot.menuType}
          locale={locale}
          expandWineAccordions={isPdfExport && snapshot.menuType === "WINE"}
        />
      </main>

      {!isBistrotLayout && (
        <footer
          className={cn(
            "border-t py-6 text-center text-xs text-neutral-400",
            MENU_PRINT_CHROME_CLASS
          )}
        >
          {tenant.name}
        </footer>
      )}
    </div>
  );
}
