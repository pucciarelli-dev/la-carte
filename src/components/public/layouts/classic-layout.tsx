import type { MenuRenderContext } from "@/lib/layouts";
import { shouldShowMenuIntro } from "@/lib/menu-intro";
import { MenuCoverHero } from "@/components/public/menu-cover-hero";
import { MenuIntroSection } from "@/components/public/menu-intro-section";
import { PublicDinnerMenu } from "@/components/public/dinner-menu";
import { PublicWineMenu } from "@/components/public/wine-menu";
import { PublicDrinkMenu } from "@/components/public/drink-menu";

export function ClassicLayout({
  categories,
  menuType,
  typography,
  allergenLegend,
  branding,
  coverImageUrl,
  coverVideoUrl,
  intro,
  subtitle,
  expandWineAccordions = false,
  forceMountWinePanels = false,
}: MenuRenderContext) {
  const showIntro = shouldShowMenuIntro(intro, coverImageUrl, coverVideoUrl);

  const introBlock = showIntro ? (
    <MenuIntroSection
      intro={intro}
      branding={branding}
      menuType={menuType}
      subtitle={subtitle}
      coverImageUrl={coverImageUrl}
      coverVideoUrl={coverVideoUrl}
    />
  ) : (
    <MenuCoverHero
      coverImageUrl={coverImageUrl}
      coverVideoUrl={coverVideoUrl}
    />
  );

  if (menuType === "DINNER") {
    return (
      <>
        {introBlock}
        <PublicDinnerMenu
          categories={categories}
          typography={typography}
          allergenLegend={allergenLegend}
          showAllergenLegend={branding.showAllergenLegend}
        />
      </>
    );
  }
  if (menuType === "WINE") {
    return (
      <>
        {introBlock}
        <PublicWineMenu
          categories={categories}
          typography={typography}
          expandAll={expandWineAccordions}
          forceMountPanels={forceMountWinePanels}
        />
      </>
    );
  }
  return (
    <>
      {introBlock}
      <PublicDrinkMenu categories={categories} typography={typography} />
    </>
  );
}
