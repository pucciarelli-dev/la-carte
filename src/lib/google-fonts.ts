import type { MenuTypography } from "@/lib/layouts";
import type { CSSProperties } from "react";

export interface GoogleFontOption {
  family: string;
  category: "sans-serif" | "serif" | "display";
  singleWeight?: boolean;
}

export const GOOGLE_FONTS: GoogleFontOption[] = [
  { family: "Inter", category: "sans-serif" },
  { family: "DM Sans", category: "sans-serif" },
  { family: "Montserrat", category: "sans-serif" },
  { family: "Raleway", category: "sans-serif" },
  { family: "Jost", category: "sans-serif" },
  { family: "Source Sans 3", category: "sans-serif" },
  { family: "Cormorant Garamond", category: "serif" },
  { family: "Playfair Display", category: "serif" },
  { family: "Lora", category: "serif" },
  { family: "Libre Baskerville", category: "serif" },
  { family: "EB Garamond", category: "serif" },
  { family: "Bodoni Moda", category: "serif" },
  { family: "Cinzel", category: "display" },
  { family: "Oswald", category: "display" },
  { family: "Bebas Neue", category: "display", singleWeight: true },
];

export const DEFAULT_MENU_TYPOGRAPHY: MenuTypography = {
  categoryFont: "Bebas Neue",
  productFont: "Jost",
  priceFont: "Cormorant Garamond",
};

/** Tipografia di riferimento del menu dinner Bistrot — usata per tutti i menu Bistrot */
export const BISTROT_MENU_TYPOGRAPHY: MenuTypography = {
  categoryFont: "Montserrat",
  productFont: "Montserrat",
  priceFont: "Inter",
};

/** Font condensato per i titoli categoria outline nel layout Bistrot */
export const BISTROT_CATEGORY_DISPLAY_FONT = "Bebas Neue";

/** Font per i paragrafi introduttivi nel layout Bistrot */
export const BISTROT_INTRO_BODY_FONT = "Montserrat";

/** Font per ingredienti e descrizioni piatti nel layout Bistrot */
export const BISTROT_DISH_INGREDIENT_FONT = BISTROT_INTRO_BODY_FONT;

export function normalizeTypography(
  value?: MenuTypography | null
): MenuTypography {
  return {
    categoryFont:
      value?.categoryFont ?? DEFAULT_MENU_TYPOGRAPHY.categoryFont,
    productFont: value?.productFont ?? DEFAULT_MENU_TYPOGRAPHY.productFont,
    priceFont: value?.priceFont ?? DEFAULT_MENU_TYPOGRAPHY.priceFont,
  };
}

export function getUniqueFonts(typography: MenuTypography): string[] {
  const fonts = [
    typography.categoryFont,
    typography.productFont,
    typography.priceFont,
  ].filter((f): f is string => Boolean(f));
  return [...new Set(fonts)];
}

export function buildGoogleFontsUrl(fonts: string[]): string | null {
  if (!fonts.length) return null;
  const families = fonts
    .map((font) => {
      const encoded = encodeURIComponent(font).replace(/%20/g, "+");
      const option = GOOGLE_FONTS.find((f) => f.family === font);
      if (option?.singleWeight) {
        return `family=${encoded}`;
      }
      return `family=${encoded}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400`;
    })
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function fontFamilyStyle(
  font?: string | null,
  fallback: "sans-serif" | "serif" = "sans-serif"
): CSSProperties {
  if (!font) return {};
  const option = GOOGLE_FONTS.find((f) => f.family === font);
  const fb = option?.category === "serif" ? "serif" : fallback;
  return { fontFamily: `"${font}", ${fb}` };
}
