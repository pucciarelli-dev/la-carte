import type { MenuLayout, MenuType, Prisma } from "@prisma/client";
import { DEFAULT_MENU_ALLERGENS } from "@/lib/allergens";
import { BISTROT_MENU_TYPOGRAPHY } from "@/lib/google-fonts";
import {
  DEFAULT_LAYOUT_BY_TYPE,
  DEFAULT_MENU_SUBTITLES,
} from "@/lib/layouts";

export interface DefaultCategoryTemplate {
  name: string;
  order: number;
  backgroundColor?: string | null;
  textColor?: string | null;
}

export interface MenuDefaults {
  layout: MenuLayout;
  subtitle: string;
  typography: Prisma.InputJsonValue;
  allergenLegend: Prisma.InputJsonValue;
  categories: DefaultCategoryTemplate[];
}

const DINNER_CATEGORY_BLACK_THEME = {
  backgroundColor: "#000000",
  textColor: "#ffffff",
} as const;

const DINNER_CATEGORIES: DefaultCategoryTemplate[] = [
  { name: "Antipasti", order: 0 },
  { name: "Primi", order: 1 },
  { name: "Secondi", order: 2, ...DINNER_CATEGORY_BLACK_THEME },
  { name: "Dessert", order: 3 },
];

const WINE_CATEGORIES: DefaultCategoryTemplate[] = [
  { name: "Al calice", order: 0 },
  { name: "Vini Bianchi", order: 1 },
  { name: "Vini Rossi", order: 2 },
  { name: "Vini Rosati", order: 3 },
];

const DRINK_CATEGORIES: DefaultCategoryTemplate[] = [
  { name: "Cocktail", order: 0 },
  { name: "Analcolici", order: 1 },
];

const DEFAULT_CATEGORIES_BY_TYPE: Record<MenuType, DefaultCategoryTemplate[]> =
  {
    DINNER: DINNER_CATEGORIES,
    WINE: WINE_CATEGORIES,
    DRINK: DRINK_CATEGORIES,
  };

export function getMenuDefaults(type: MenuType): MenuDefaults {
  return {
    layout: DEFAULT_LAYOUT_BY_TYPE[type],
    subtitle: DEFAULT_MENU_SUBTITLES[type],
    typography: BISTROT_MENU_TYPOGRAPHY as unknown as Prisma.InputJsonValue,
    allergenLegend:
      DEFAULT_MENU_ALLERGENS as unknown as Prisma.InputJsonValue,
    categories: DEFAULT_CATEGORIES_BY_TYPE[type],
  };
}
