import type { MenuAllergenEntry } from "@/lib/allergens";
import {
  getEnabledAllergens,
  formatAllergenLegendLine,
  getAllergenLegendTitle,
} from "@/lib/allergens";
import type { MenuLocale } from "@/lib/locale";
import { staticMenuText } from "@/lib/locale";
import { getMenuFooterCoverNoteIt } from "@/lib/branding-footer";
import type { MenuIntro } from "@/lib/menu-intro";
import {
  BISTROT_INTRO_BODY_FONT,
  fontFamilyStyle,
} from "@/lib/google-fonts";
import { CATEGORY_BAND_INNER_CLASS } from "@/lib/category-styles";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import { cn } from "@/lib/utils";
import { MenuIntroLogo } from "@/components/public/menu-intro-logo";
import { BistrotWaveDivider } from "@/components/public/bistrot-wave-divider";
import { ALLERGEN_LEGEND } from "@/lib/constants";
import { MENU_PRINT_PAGE_FOOTER_CLASS, MENU_PRINT_ALLERGEN_SECTION_CLASS, MENU_PRINT_ALLERGEN_LEGEND_CLASS } from "@/lib/menu-print";

interface MenuIntroFooterProps {
  intro?: MenuIntro | null;
  footerNoteIt?: string | null;
  allergenLegend?: MenuAllergenEntry[];
  showAllergens?: boolean;
  locale?: MenuLocale;
}

export function shouldShowMenuIntroFooter({
  intro,
  footerNoteIt,
  allergenLegend,
  showAllergens = true,
}: MenuIntroFooterProps): boolean {
  const coverNoteIt = getMenuFooterCoverNoteIt(footerNoteIt);
  const legend = getEnabledAllergens(
    allergenLegend ?? ALLERGEN_LEGEND.map((entry) => ({ ...entry, enabled: true }))
  );
  const hasAllergens = showAllergens && legend.length > 0;
  return Boolean(intro?.logoUrl || coverNoteIt || hasAllergens);
}

export function MenuIntroFooter({
  intro,
  footerNoteIt,
  allergenLegend,
  showAllergens = true,
  locale = "it",
}: MenuIntroFooterProps) {
  if (
    !shouldShowMenuIntroFooter({
      intro,
      footerNoteIt,
      allergenLegend,
      showAllergens,
    })
  ) {
    return null;
  }

  const coverNote = getMenuFooterCoverNoteIt(footerNoteIt);
  const legend = getEnabledAllergens(
    allergenLegend ?? ALLERGEN_LEGEND.map((entry) => ({ ...entry, enabled: true }))
  );
  const hasAllergens = showAllergens && legend.length > 0;
  const footerBodyStyle = {
    ...fontFamilyStyle(BISTROT_INTRO_BODY_FONT, "sans-serif"),
    fontWeight: 400,
  };

  return (
    <div
      className={cn(
        MENU_PRINT_PAGE_FOOTER_CLASS,
        "menu-full-bleed relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-black text-white"
      )}
    >
      <div
        className={cn(CATEGORY_BAND_INNER_CLASS, "py-16 text-center")}
        style={footerBodyStyle}
      >
        {intro?.logoUrl && (
          <MenuIntroLogo logoUrl={intro.logoUrl} inverted className="mb-8" />
        )}

        {coverNote && (
          <div className="space-y-1.5">
            <p className={t.introFooterNote}>{coverNote}</p>
          </div>
        )}

        {hasAllergens && (
          <div
            className={cn(
              MENU_PRINT_ALLERGEN_SECTION_CLASS,
              "text-center",
              (intro?.logoUrl || coverNote) && "mt-8"
            )}
          >
            <BistrotWaveDivider inverted className="mt-10 mb-10 py-0" />
            <p className={t.introFooterFrozenTitle}>
              {staticMenuText("frozenProduct", locale)}
            </p>
            <p className={t.introFooterLegendDisclaimer}>
              {staticMenuText("frozenDisclaimer", locale)}
            </p>
            <p className={cn(t.introFooterLegendTitle, "mt-8")}>
              {getAllergenLegendTitle(locale)}
            </p>
            <div
              className={cn(
                MENU_PRINT_ALLERGEN_LEGEND_CLASS,
                t.introFooterLegendBody,
                "mt-4 text-center"
              )}
            >
              {legend.map((entry) => (
                <p key={entry.num} className="mb-0.5 break-inside-avoid">
                  {formatAllergenLegendLine(entry, locale)}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
