import type { TenantBranding } from "@/lib/layouts";
import { localizedText, type MenuLocale } from "@/lib/locale";

export const DEFAULT_NEWSLETTER_TEXT =
  "Se vuoi ricevere novità e comunicazioni, iscriviti alla nostra newsletter.";

export const DEFAULT_NEWSLETTER_TEXT_EN =
  "If you'd like to receive news and updates, subscribe to our newsletter.";

export const DEFAULT_NEWSLETTER_LINK_LABEL = "iscriviti alla nostra newsletter";

export const DEFAULT_NEWSLETTER_LINK_LABEL_EN = "subscribe to our newsletter";

export function getNewsletterText(
  branding: TenantBranding,
  locale: MenuLocale = "it"
): string | null {
  const custom = localizedText(
    branding.newsletterText,
    branding.newsletterTextEn,
    locale
  );
  return custom || null;
}

export function normalizeNewsletterUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getNewsletterUrl(branding: TenantBranding): string | null {
  const url = branding.newsletterUrl?.trim();
  if (!url) return null;
  return normalizeNewsletterUrl(url);
}

export function getNewsletterLinkLabel(
  branding: TenantBranding,
  locale: MenuLocale = "it"
): string {
  const custom = localizedText(
    branding.newsletterLinkLabel,
    branding.newsletterLinkLabelEn,
    locale
  );
  if (custom) return custom;
  return locale === "en"
    ? DEFAULT_NEWSLETTER_LINK_LABEL_EN
    : DEFAULT_NEWSLETTER_LINK_LABEL;
}

export function shouldShowNewsletter(
  branding: TenantBranding,
  locale: MenuLocale = "it"
): boolean {
  return Boolean(getNewsletterText(branding, locale));
}

export function splitNewsletterText(
  text: string,
  linkLabel: string
): { before: string; link: string; after: string } | null {
  const idx = text.toLowerCase().indexOf(linkLabel.toLowerCase());
  if (idx < 0) return null;
  return {
    before: text.slice(0, idx),
    link: text.slice(idx, idx + linkLabel.length),
    after: text.slice(idx + linkLabel.length),
  };
}
