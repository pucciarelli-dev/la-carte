import type { MenuRenderContext } from "@/lib/layouts";
import { DEFAULT_MENU_SUBTITLES } from "@/lib/layouts";
import { shouldShowMenuIntro } from "@/lib/menu-intro";
import { BISTROT_MENU_ARTICLE_CLASS } from "@/lib/bistrot-layout";
import { BistrotFallbackHeader } from "@/components/public/bistrot-fallback-header";
import { MenuIntroSection } from "@/components/public/menu-intro-section";
import { MenuPageFooter } from "@/components/public/menu-page-footer";
import { MenuBackToTop } from "@/components/public/menu-back-to-top";
import { BistrotWineCategoriesAccordion } from "@/components/public/wine-categories-accordion";

export function BistrotWineLayout({
  categories,
  branding,
  typography,
  coverImageUrl,
  coverVideoUrl,
  intro,
  subtitle,
  menuType,
  locale = "it",
  expandWineAccordions = false,
  forceMountWinePanels = false,
}: MenuRenderContext) {
  const showIntro = shouldShowMenuIntro(intro, coverImageUrl, coverVideoUrl);

  return (
    <article className={BISTROT_MENU_ARTICLE_CLASS}>
      {showIntro ? (
        <MenuIntroSection
          intro={intro}
          branding={branding}
          menuType={menuType}
          subtitle={subtitle}
          coverImageUrl={coverImageUrl}
          coverVideoUrl={coverVideoUrl}
          className={coverImageUrl || coverVideoUrl ? "mb-0" : undefined}
        />
      ) : (
        <BistrotFallbackHeader
          branding={branding}
          subtitle={subtitle}
          defaultSubtitle={DEFAULT_MENU_SUBTITLES.WINE}
          typography={typography}
        />
      )}

      <BistrotWineCategoriesAccordion
        categories={categories}
        typography={typography}
        expandAll={expandWineAccordions}
        forceMountPanels={forceMountWinePanels}
      />

      <MenuPageFooter
        branding={branding}
        intro={intro}
        footerNoteIt={intro?.footerNoteIt}
        showAllergens={false}
        locale={locale}
      />
      <MenuBackToTop />
    </article>
  );
}
