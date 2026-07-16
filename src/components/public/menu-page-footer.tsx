import type { MenuAllergenEntry } from "@/lib/allergens";
import type { MenuIntro } from "@/lib/menu-intro";
import type { TenantBranding } from "@/lib/layouts";
import { shouldShowNewsletter } from "@/lib/menu-newsletter";
import {
  MenuIntroFooter,
  shouldShowMenuIntroFooter,
} from "@/components/public/menu-intro-footer";
import { MenuNewsletterSection } from "@/components/public/menu-newsletter-section";

import type { MenuLocale } from "@/lib/locale";

interface MenuPageFooterProps {
  branding: TenantBranding;
  intro?: MenuIntro | null;
  footerNoteIt?: string | null;
  allergenLegend?: MenuAllergenEntry[];
  showAllergens?: boolean;
  locale?: MenuLocale;
}

export function MenuPageFooter(props: MenuPageFooterProps) {
  const showIntroFooter = shouldShowMenuIntroFooter(props);
  const locale = props.locale ?? "it";
  const showNewsletter = shouldShowNewsletter(props.branding, locale);

  if (!showIntroFooter && !showNewsletter) return null;

  return (
    <>
      {showIntroFooter && <MenuIntroFooter {...props} />}
      {showNewsletter && (
        <MenuNewsletterSection branding={props.branding} locale={locale} />
      )}
    </>
  );
}
