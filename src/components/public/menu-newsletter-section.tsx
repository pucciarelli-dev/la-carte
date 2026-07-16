import type { TenantBranding } from "@/lib/layouts";
import type { MenuLocale } from "@/lib/locale";
import { fontFamilyStyle, BISTROT_CATEGORY_DISPLAY_FONT, BISTROT_INTRO_BODY_FONT } from "@/lib/google-fonts";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import {
  getNewsletterLinkLabel,
  getNewsletterText,
  getNewsletterUrl,
  shouldShowNewsletter,
  splitNewsletterText,
} from "@/lib/menu-newsletter";
import { MENU_PRINT_PAGE_SECTION_CLASS, MENU_PRINT_EXCLUDE_CLASS } from "@/lib/menu-print";
import { cn } from "@/lib/utils";

interface MenuNewsletterSectionProps {
  branding: TenantBranding;
  locale?: MenuLocale;
}

export function MenuNewsletterSection({
  branding,
  locale = "it",
}: MenuNewsletterSectionProps) {
  if (!shouldShowNewsletter(branding, locale)) return null;

  const text = getNewsletterText(branding, locale)!;
  const url = getNewsletterUrl(branding);
  const linkLabel = getNewsletterLinkLabel(branding, locale);
  const parts = url ? splitNewsletterText(text, linkLabel) : null;
  const bodyStyle = {
    ...fontFamilyStyle(BISTROT_INTRO_BODY_FONT, "sans-serif"),
    fontWeight: 400,
  };
  const linkStyle = fontFamilyStyle(BISTROT_CATEGORY_DISPLAY_FONT, "sans-serif");

  const newsletterLink = (label: string) => (
    <a
      href={url!}
      target="_blank"
      rel="noopener noreferrer"
      className={t.newsletterLink}
      style={linkStyle}
    >
      {label}
    </a>
  );

  return (
    <section
      className={cn(
        MENU_PRINT_PAGE_SECTION_CLASS,
        MENU_PRINT_EXCLUDE_CLASS,
        "menu-full-bleed relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 border-t border-[#e8e8e8] bg-white"
      )}
    >
      <div className="mx-auto max-w-[210mm] px-6 py-8 text-center sm:px-8 sm:py-8">
        <p className={t.newsletterText} style={bodyStyle}>
          {url && parts ? (
            <>
              {parts.before}
              {newsletterLink(parts.link)}
              {parts.after}
            </>
          ) : url ? (
            <>
              {text} {newsletterLink(linkLabel)}
            </>
          ) : (
            text
          )}
        </p>
      </div>
    </section>
  );
}
