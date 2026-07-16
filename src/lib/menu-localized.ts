import type { MenuIntro } from "@/lib/menu-intro";
import { localizedText, type MenuLocale } from "@/lib/locale";
import type {
  PublishedCategory,
  PublishedCategoryWithItems,
  PublishedDrinkItem,
  PublishedMenuItem,
  PublishedWineItem,
} from "@/types";

export const DEFAULT_CATEGORY_NAME_IT = "Nuova categoria";
export const DEFAULT_CATEGORY_NAME_EN = "New category";

/** Categoria mostrata per la lingua corrente (dashboard e menu pubblico). */
export function categoryVisibleInLocale(
  category: Pick<PublishedCategory, "name" | "nameEn">,
  locale: MenuLocale
): boolean {
  const itName = category.name.trim();
  const enName = category.nameEn?.trim() ?? "";

  if (locale === "it") {
    if (itName === DEFAULT_CATEGORY_NAME_IT && enName) {
      return false;
    }
    return Boolean(itName);
  }

  if (enName) return true;
  if (itName === DEFAULT_CATEGORY_NAME_IT) return false;
  return Boolean(itName);
}

export function resolveCategoryName(
  category: Pick<PublishedCategory, "name" | "nameEn">,
  locale: MenuLocale
): string {
  return localizedText(category.name, category.nameEn, locale);
}

export function resolveMenuItemName(
  item: Pick<PublishedMenuItem, "name" | "nameEn">,
  locale: MenuLocale
): string {
  return localizedText(item.name, item.nameEn, locale);
}

export function resolveMenuItemDescription(
  item: Pick<PublishedMenuItem, "description" | "descriptionEn">,
  locale: MenuLocale
): string {
  return localizedText(item.description, item.descriptionEn, locale);
}

export function resolveWineItemName(
  item: Pick<PublishedWineItem, "name" | "nameEn">,
  locale: MenuLocale
): string {
  return localizedText(item.name, item.nameEn, locale);
}

export function resolveWineItemDescription(
  item: Pick<PublishedWineItem, "description" | "descriptionEn">,
  locale: MenuLocale
): string {
  return localizedText(item.description, item.descriptionEn, locale);
}

export function resolveWineItemRegion(
  item: Pick<PublishedWineItem, "subcategory" | "subcategoryEn">,
  locale: MenuLocale
): string {
  return resolveWineItemSubcategory(item, locale);
}

export function resolveWineItemSubcategory(
  item: Pick<PublishedWineItem, "subcategory" | "subcategoryEn">,
  locale: MenuLocale
): string {
  return localizedText(item.subcategory, item.subcategoryEn, locale);
}

export function resolveDrinkItemName(
  item: Pick<PublishedDrinkItem, "name" | "nameEn">,
  locale: MenuLocale
): string {
  return localizedText(item.name, item.nameEn, locale);
}

export function resolveDrinkItemDescription(
  item: Pick<PublishedDrinkItem, "description" | "descriptionEn">,
  locale: MenuLocale
): string {
  return localizedText(item.description, item.descriptionEn, locale);
}

export function resolveDrinkItemIngredients(
  item: Pick<PublishedDrinkItem, "ingredients" | "ingredientsEn">,
  locale: MenuLocale
): string {
  return localizedText(item.ingredients, item.ingredientsEn, locale);
}

export function resolveMenuSubtitle(
  subtitle: string | null | undefined,
  subtitleEn: string | null | undefined,
  locale: MenuLocale
): string | null {
  const value = localizedText(subtitle, subtitleEn, locale);
  return value || null;
}

export function resolveFooterNote(
  intro: MenuIntro | null | undefined,
  locale: MenuLocale
): string | null {
  if (!intro) return null;
  const value = localizedText(intro.footerNoteIt, intro.footerNoteEn, locale);
  return value || null;
}

const INTRO_LOCALIZED_FIELDS = [
  ["eyebrow", "eyebrowEn"],
  ["heroTitle", "heroTitleEn"],
  ["sectionTitle", "sectionTitleEn"],
  ["bodyText", "bodyTextEn"],
  ["bodyImageTagline", "bodyImageTaglineEn"],
  ["bodyTextSecondary", "bodyTextSecondaryEn"],
] as const;

export function localizeIntro(
  intro: MenuIntro | null | undefined,
  locale: MenuLocale
): MenuIntro | null {
  if (!intro) return null;
  const localized: MenuIntro = { ...intro };
  for (const [itKey, enKey] of INTRO_LOCALIZED_FIELDS) {
    localized[itKey] = localizedText(intro[itKey], intro[enKey], locale) || null;
  }
  localized.footerNoteIt = resolveFooterNote(intro, locale);
  return localized;
}

export function localizeMenuItem(
  item: PublishedMenuItem,
  locale: MenuLocale
): PublishedMenuItem {
  return {
    ...item,
    name: resolveMenuItemName(item, locale),
    description: resolveMenuItemDescription(item, locale),
  };
}

export function localizeWineItem(
  item: PublishedWineItem,
  locale: MenuLocale
): PublishedWineItem {
  return {
    ...item,
    name: resolveWineItemName(item, locale),
    description: resolveWineItemDescription(item, locale),
    region: resolveWineItemRegion(item, locale),
    subcategory: resolveWineItemSubcategory(item, locale),
  };
}

export function localizeDrinkItem(
  item: PublishedDrinkItem,
  locale: MenuLocale
): PublishedDrinkItem {
  return {
    ...item,
    name: resolveDrinkItemName(item, locale),
    description: resolveDrinkItemDescription(item, locale),
    ingredients: resolveDrinkItemIngredients(item, locale),
  };
}

export function localizeCategory<T extends PublishedCategoryWithItems>(
  category: T,
  locale: MenuLocale
): T {
  return {
    ...category,
    name: resolveCategoryName(category, locale),
    menuItems: category.menuItems?.map((item) => localizeMenuItem(item, locale)),
    wineItems: category.wineItems?.map((item) => localizeWineItem(item, locale)),
    drinkItems: category.drinkItems?.map((item) => localizeDrinkItem(item, locale)),
  };
}
