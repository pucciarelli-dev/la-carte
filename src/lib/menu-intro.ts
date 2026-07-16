import type { TenantBranding } from "@/lib/layouts";

export interface MenuIntro {
  logoUrl?: string | null;
  sectionLogoUrl?: string | null;
  eyebrow?: string | null;
  heroTitle?: string | null;
  address?: string | null;
  sectionTitle?: string | null;
  bodyText?: string | null;
  bodyImageUrl?: string | null;
  bodyImageTagline?: string | null;
  bodyTextSecondary?: string | null;
  footerNoteIt?: string | null;
  footerNoteEn?: string | null;
  eyebrowEn?: string | null;
  heroTitleEn?: string | null;
  sectionTitleEn?: string | null;
  bodyTextEn?: string | null;
  bodyImageTaglineEn?: string | null;
  bodyTextSecondaryEn?: string | null;
}

export function parseMenuIntro(value: unknown): MenuIntro | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const str = (key: string) =>
    typeof v[key] === "string" ? (v[key] as string) : null;

  return {
    logoUrl: str("logoUrl"),
    sectionLogoUrl: str("sectionLogoUrl"),
    eyebrow: str("eyebrow"),
    heroTitle: str("heroTitle"),
    address: str("address"),
    sectionTitle: str("sectionTitle"),
    bodyText: str("bodyText"),
    bodyImageUrl: str("bodyImageUrl"),
    bodyImageTagline: str("bodyImageTagline"),
    bodyTextSecondary: str("bodyTextSecondary"),
    footerNoteIt: str("footerNoteIt"),
    footerNoteEn: str("footerNoteEn"),
    eyebrowEn: str("eyebrowEn"),
    heroTitleEn: str("heroTitleEn"),
    sectionTitleEn: str("sectionTitleEn"),
    bodyTextEn: str("bodyTextEn"),
    bodyImageTaglineEn: str("bodyImageTaglineEn"),
    bodyTextSecondaryEn: str("bodyTextSecondaryEn"),
  };
}

function hasIntroText(value?: string | null): boolean {
  return Boolean(value?.trim());
}

const INTRO_TEXT_SECTION_FIELDS = [
  "sectionLogoUrl",
  "sectionTitle",
  "bodyText",
  "bodyImageUrl",
  "bodyImageTagline",
  "bodyTextSecondary",
] as const satisfies readonly (keyof MenuIntro)[];

export function getIntroTextSectionContent(
  intro?: MenuIntro | null
): Pick<
  MenuIntro,
  | "sectionLogoUrl"
  | "sectionTitle"
  | "bodyText"
  | "bodyImageUrl"
  | "bodyImageTagline"
  | "bodyTextSecondary"
> {
  const parsed = parseMenuIntro(intro) ?? {};

  return {
    sectionLogoUrl: hasIntroText(parsed.sectionLogoUrl)
      ? parsed.sectionLogoUrl!.trim()
      : null,
    sectionTitle: hasIntroText(parsed.sectionTitle)
      ? parsed.sectionTitle!.trim()
      : null,
    bodyText: hasIntroText(parsed.bodyText) ? parsed.bodyText!.trim() : null,
    bodyImageUrl: hasIntroText(parsed.bodyImageUrl)
      ? parsed.bodyImageUrl!.trim()
      : null,
    bodyImageTagline: hasIntroText(parsed.bodyImageTagline)
      ? parsed.bodyImageTagline!.trim()
      : null,
    bodyTextSecondary: hasIntroText(parsed.bodyTextSecondary)
      ? parsed.bodyTextSecondary!.trim()
      : null,
  };
}

export function shouldShowIntroTextSection(intro?: MenuIntro | null): boolean {
  const content = getIntroTextSectionContent(intro);
  return INTRO_TEXT_SECTION_FIELDS.some((field) => Boolean(content[field]));
}

export function normalizeMenuIntro(
  intro: MenuIntro | null | undefined,
  branding: TenantBranding,
  menuType: import("@prisma/client").MenuType
): MenuIntro {
  const defaultHeroTitle =
    menuType === "DINNER" ? "MENÙ" : menuType === "WINE" ? "WINE" : "DRINK";

  return {
    logoUrl: intro?.logoUrl ?? null,
    sectionLogoUrl: intro?.sectionLogoUrl ?? null,
    eyebrow: intro?.eyebrow ?? null,
    heroTitle: intro?.heroTitle ?? defaultHeroTitle,
    address: intro?.address ?? branding.address ?? null,
    sectionTitle: intro?.sectionTitle ?? null,
    bodyText: intro?.bodyText ?? null,
    bodyImageUrl: intro?.bodyImageUrl ?? null,
    bodyImageTagline: intro?.bodyImageTagline ?? null,
    bodyTextSecondary: intro?.bodyTextSecondary ?? null,
    footerNoteIt: intro?.footerNoteIt ?? null,
    footerNoteEn: intro?.footerNoteEn ?? null,
    eyebrowEn: intro?.eyebrowEn ?? null,
    heroTitleEn: intro?.heroTitleEn ?? null,
    sectionTitleEn: intro?.sectionTitleEn ?? null,
    bodyTextEn: intro?.bodyTextEn ?? null,
    bodyImageTaglineEn: intro?.bodyImageTaglineEn ?? null,
    bodyTextSecondaryEn: intro?.bodyTextSecondaryEn ?? null,
  };
}

export function getMenuIntroForForm(
  intro: MenuIntro | null | undefined,
  branding: TenantBranding,
  menuType: import("@prisma/client").MenuType
): MenuIntro {
  return normalizeMenuIntro(parseMenuIntro(intro) ?? {}, branding, menuType);
}

export function shouldShowIntroContent(intro?: MenuIntro | null): boolean {
  return shouldShowIntroTextSection(intro);
}

export function shouldShowMenuIntro(
  rawIntro: MenuIntro | null | undefined,
  coverImageUrl?: string | null,
  coverVideoUrl?: string | null
): boolean {
  if (coverImageUrl || coverVideoUrl) return true;
  if (!rawIntro) return false;

  const heroFields = Boolean(
    rawIntro.logoUrl ||
      rawIntro.eyebrow ||
      rawIntro.heroTitle ||
      rawIntro.address
  );

  return heroFields || shouldShowIntroTextSection(rawIntro);
}
