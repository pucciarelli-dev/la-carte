import { localizedText, type MenuLocale } from "@/lib/locale";
import {
  categoryVisibleInLocale,
  DEFAULT_CATEGORY_NAME_IT,
} from "@/lib/menu-localized";

export { DEFAULT_CATEGORY_NAME_IT };
export const DEFAULT_CATEGORY_NAME_EN = "New category";
export const DEFAULT_DISH_NAME_IT = "Nuovo piatto";
export const DEFAULT_DISH_NAME_EN = "New dish";
export const DEFAULT_WINE_NAME_IT = "Nuovo vino";
export const DEFAULT_WINE_NAME_EN = "New wine";
export const DEFAULT_DRINK_NAME_IT = "Nuovo drink";
export const DEFAULT_DRINK_NAME_EN = "New drink";

/** Testo mostrato in lista/titoli: EN se presente, altrimenti fallback IT. */
export function editorFieldText(
  primary: string | null | undefined,
  secondary: string | null | undefined,
  locale: MenuLocale
): string {
  return localizedText(primary, secondary, locale);
}

/** Valore negli input: non usare trim, altrimenti gli spazi vengono persi durante la digitazione. */
export function editorInputValue(
  primary: string | null | undefined,
  secondary: string | null | undefined,
  locale: MenuLocale
): string {
  if (locale === "en") {
    if (secondary != null && secondary !== "") {
      return secondary;
    }
    return primary ?? "";
  }
  return primary ?? "";
}

export function isEnglishLocale(locale: MenuLocale): boolean {
  return locale === "en";
}

export function localizedLabel(label: string, locale: MenuLocale): string {
  return isEnglishLocale(locale) ? `${label} (EN)` : label;
}

export function displayCategoryName(
  category: { name: string; nameEn?: string | null },
  locale: MenuLocale
): string {
  const text = editorFieldText(category.name, category.nameEn, locale);
  return text || category.name || "Senza nome";
}

/** Categoria visibile nella vista corrente del dashboard. */
export function categoryVisibleInEditor(
  category: { name: string; nameEn?: string | null },
  locale: MenuLocale
): boolean {
  return categoryVisibleInLocale(category, locale);
}

export function buildNewCategoryPayload(
  displayName: string,
  locale: MenuLocale,
  colors: {
    backgroundColor?: string | null;
    textColor?: string | null;
  } = {}
): {
  name: string;
  nameEn: string;
  backgroundColor?: string | null;
  textColor?: string | null;
} {
  const trimmed = displayName.trim();
  if (locale === "en") {
    return {
      name: DEFAULT_CATEGORY_NAME_IT,
      nameEn: trimmed,
      ...colors,
    };
  }
  return {
    name: trimmed,
    nameEn: "",
    ...colors,
  };
}

export function mergeReorderedCategories<T extends { id: string; order: number }>(
  all: T[],
  reorderedVisible: T[]
): T[] {
  const visibleIds = new Set(reorderedVisible.map((category) => category.id));
  const hidden = all.filter((category) => !visibleIds.has(category.id));
  return [...reorderedVisible, ...hidden].map((category, index) => ({
    ...category,
    order: index,
  }));
}

export function buildNewMenuItemDefaults(locale: MenuLocale) {
  if (locale === "en") {
    return {
      name: DEFAULT_DISH_NAME_IT,
      nameEn: DEFAULT_DISH_NAME_EN,
      description: "",
      price: 0,
    };
  }
  return {
    name: DEFAULT_DISH_NAME_IT,
    nameEn: "",
    description: "",
    price: 0,
  };
}

export function buildNewWineItemDefaults(locale: MenuLocale) {
  if (locale === "en") {
    return {
      name: DEFAULT_WINE_NAME_IT,
      nameEn: DEFAULT_WINE_NAME_EN,
      producer: "",
      subcategory: "",
      description: "",
    };
  }
  return {
    name: DEFAULT_WINE_NAME_IT,
    nameEn: "",
    producer: "",
    subcategory: "",
    description: "",
  };
}

export function buildNewDrinkItemDefaults(locale: MenuLocale) {
  if (locale === "en") {
    return {
      name: DEFAULT_DRINK_NAME_IT,
      nameEn: DEFAULT_DRINK_NAME_EN,
      ingredients: "",
      description: "",
      price: 0,
    };
  }
  return {
    name: DEFAULT_DRINK_NAME_IT,
    nameEn: "",
    ingredients: "",
    description: "",
    price: 0,
  };
}

export function displayItemName(
  item: { name: string; nameEn?: string | null },
  locale: MenuLocale
): string {
  const text = editorFieldText(item.name, item.nameEn, locale);
  return text || item.name || "Senza nome";
}

export function displayItemDescription(
  item: { description?: string | null; descriptionEn?: string | null },
  locale: MenuLocale
): string {
  return editorFieldText(item.description, item.descriptionEn, locale);
}

export function displayWineSubcategory(
  item: { subcategory: string; subcategoryEn?: string | null },
  locale: MenuLocale
): string {
  return editorFieldText(item.subcategory, item.subcategoryEn, locale);
}

export function displayWineItemSubtitle(
  item: {
    subcategory: string;
    subcategoryEn?: string | null;
    producer: string;
    vintage: string | null;
  },
  locale: MenuLocale
): string {
  return [
    displayWineSubcategory(item, locale),
    item.producer,
    item.vintage,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function displayDrinkIngredients(
  item: { ingredients?: string | null; ingredientsEn?: string | null },
  locale: MenuLocale
): string {
  return editorFieldText(item.ingredients, item.ingredientsEn, locale);
}
