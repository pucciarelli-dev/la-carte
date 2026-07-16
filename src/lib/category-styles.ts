import type { CSSProperties } from "react";
import type { PublishedCategory } from "@/types";
import { cn } from "@/lib/utils";

/** Vertical rhythm shared by all category sections */
export const CATEGORY_SECTION_TOP_PADDING_CLASS = "pt-16 sm:pt-20";
export const CATEGORY_SECTION_BOTTOM_PADDING_CLASS = "pb-16 sm:pb-20";

/** Full-width band for categories with custom background */
export const CATEGORY_BAND_OUTER_CLASS =
  "menu-full-bleed relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2";

export const CATEGORY_BAND_INNER_CLASS =
  "mx-auto max-w-[210mm] px-4 sm:px-8";

/** Larghezza contenuto senza padding orizzontale (va sulle section) */
export const CATEGORY_BAND_CONTENT_CLASS = "mx-auto max-w-[210mm]";

export const CATEGORY_DISH_THEMED_CLASS =
  "[&_h2]:text-inherit [&_span]:text-inherit [&_.dish-muted]:text-current/72";

/** Tailwind utilities for category blocks with custom text color */
export const CATEGORY_THEMED_CLASS =
  "[&_h2]:text-inherit [&_h3]:text-inherit [&_p]:text-inherit [&_span]:text-inherit [&_.text-neutral-900]:text-inherit [&_.text-neutral-800]:text-inherit [&_.text-neutral-700]:text-inherit [&_.text-neutral-600]:text-inherit [&_.font-medium]:text-inherit [&_.text-neutral-500]:text-current/72 [&_.text-neutral-400]:text-current/72 [&_.italic]:text-current/72";

export function getCategoryBlockStyle(
  category: Pick<PublishedCategory, "backgroundColor" | "textColor">
): CSSProperties {
  const style: CSSProperties = {};
  if (category.backgroundColor) {
    style.backgroundColor = category.backgroundColor;
    (style as Record<string, string>)["--category-page-bg"] =
      category.backgroundColor;
  }
  if (category.textColor) {
    style.color = category.textColor;
    (style as Record<string, string>)["--category-text"] = category.textColor;
  }
  return style;
}

export function hasCategoryAppearance(
  category: Pick<PublishedCategory, "backgroundColor" | "textColor">
): boolean {
  return Boolean(category.backgroundColor || category.textColor);
}

export function getCategorySectionClassName(
  category: Pick<PublishedCategory, "backgroundColor" | "textColor">,
  className?: string
): string {
  return cn(
    hasCategoryAppearance(category) && CATEGORY_BAND_OUTER_CLASS,
    hasCategoryAppearance(category) && CATEGORY_DISH_THEMED_CLASS,
    category.textColor && CATEGORY_THEMED_CLASS,
    className
  );
}

export function categoryUsesLightIcon(
  category: Pick<PublishedCategory, "backgroundColor" | "textColor">
): boolean {
  const text = category.textColor?.trim().toLowerCase();
  if (text === "#ffffff" || text === "white") return true;

  const background = category.backgroundColor?.trim();
  if (!background) return false;

  const hex = background.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return false;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance < 0.45;
}
