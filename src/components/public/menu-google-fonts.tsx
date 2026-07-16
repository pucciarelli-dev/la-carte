import type { MenuTypography } from "@/lib/layouts";
import {
  BISTROT_CATEGORY_DISPLAY_FONT,
  BISTROT_INTRO_BODY_FONT,
  buildGoogleFontsUrl,
  getUniqueFonts,
  normalizeTypography,
} from "@/lib/google-fonts";

interface MenuGoogleFontsProps {
  typography: MenuTypography;
}

export function MenuGoogleFonts({ typography }: MenuGoogleFontsProps) {
  const normalized = normalizeTypography(typography);
  const fonts = getUniqueFonts(normalized);
  if (!fonts.includes(BISTROT_CATEGORY_DISPLAY_FONT)) {
    fonts.unshift(BISTROT_CATEGORY_DISPLAY_FONT);
  }
  if (!fonts.includes(BISTROT_INTRO_BODY_FONT)) {
    fonts.push(BISTROT_INTRO_BODY_FONT);
  }
  const url = buildGoogleFontsUrl(fonts);
  if (!url) return null;

  return <link rel="stylesheet" href={url} />;
}
