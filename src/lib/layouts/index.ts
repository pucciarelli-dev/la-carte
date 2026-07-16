import type { MenuLayout, MenuType } from "@prisma/client";
import type { PublishedCategoryWithItems } from "@/types";
import type { MenuAllergenEntry } from "@/lib/allergens";
import type { MenuIntro } from "@/lib/menu-intro";
import type { MenuLocale } from "@/lib/locale";

export type { MenuAllergenEntry } from "@/lib/allergens";

export interface MenuTypography {
  categoryFont?: string | null;
  productFont?: string | null;
  priceFont?: string | null;
}

export interface TenantBranding {
  displayName: string;
  address: string;
  tagline: string;
  coverCharge?: number;
  introText?: string;
  introTextSecondary?: string;
  introTextEn?: string;
  showAllergenLegend?: boolean;
  footerNoteIt?: string;
  footerNoteEn?: string;
  newsletterText?: string;
  newsletterTextEn?: string;
  newsletterUrl?: string;
  newsletterLinkLabel?: string;
  newsletterLinkLabelEn?: string;
}

export interface MenuRenderContext {
  categories: PublishedCategoryWithItems[];
  branding: TenantBranding;
  typography: MenuTypography;
  allergenLegend?: MenuAllergenEntry[];
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  intro?: MenuIntro | null;
  subtitle?: string | null;
  menuName: string;
  menuType: MenuType;
  locale?: MenuLocale;
  /** Espande tutti i pannelli (es. export PDF vini). */
  expandWineAccordions?: boolean;
}

export interface LayoutDefinition {
  id: MenuLayout;
  name: string;
  description: string;
  menuTypes: MenuType[];
  referenceUrl?: string;
}

export const DEFAULT_BRANDING: TenantBranding = {
  displayName: "BISTROT",
  address: "Via Eugenio Brizi 4 MILANO",
  tagline: "CONTEMPORARY DINING EXPERIENCE",
  coverCharge: 3.5,
  introText:
    "Un menù di \"FINE DINING\" che si caratterizza per una cucina semplice, basata sul sapiente uso della materia prima e su tecniche di preparazione sofisticate. Un approccio orientato alla qualità in un contesto di piena informalità, ideale per chi predilige stile e sostanza.",
  introTextSecondary:
    "Piatti leggibili, riconoscibili, di matrice italiana, ma aperti alle contaminazioni del mondo, espressione di una cucina contemporanea e ricercata e allo stesso tempo, rigorosa ed evocativa, che non tradisce mai l'etica pur rendendo onore all'estetica.",
  showAllergenLegend: true,
};

export const MENU_LAYOUTS: LayoutDefinition[] = [
  {
    id: "CLASSIC",
    name: "Classico",
    description: "Layout pulito e minimale, adatto a qualsiasi ristorante.",
    menuTypes: ["DINNER", "WINE", "DRINK"],
  },
  {
    id: "BISTROT_DINNER",
    name: "Bistrot — Cena",
    description:
      "Stile à la carte con titoli distanziati, testo introduttivo e legenda allergeni.",
    menuTypes: ["DINNER"],
    referenceUrl:
      "https://bistrot.southgarage.com/wp-content/uploads/2026/03/menu-dinner.pdf",
  },
  {
    id: "BISTROT_WINE",
    name: "Bistrot — Vini",
    description:
      "Lista vini a colonne con prezzi calice/bottiglia e raggruppamento per regione.",
    menuTypes: ["WINE"],
    referenceUrl:
      "https://bistrot.southgarage.com/wp-content/uploads/2026/03/MENU_WINE-nov_2025_compressed-1.pdf",
  },
  {
    id: "BISTROT_DRINK",
    name: "Bistrot — Drink",
    description:
      "Lista cocktail con nomi distanziati, descrizioni gin e sezione mixer.",
    menuTypes: ["DRINK"],
    referenceUrl:
      "https://bistrot.southgarage.com/wp-content/uploads/2025/10/menu_DRINK.pdf",
  },
];

export const DEFAULT_MENU_SUBTITLES: Record<MenuType, string> = {
  DINNER: "A LA CARTE",
  WINE: "LIST",
  DRINK: "LIST",
};

export const DEFAULT_LAYOUT_BY_TYPE: Record<MenuType, MenuLayout> = {
  DINNER: "BISTROT_DINNER",
  WINE: "BISTROT_WINE",
  DRINK: "BISTROT_DRINK",
};

export function getLayoutsForMenuType(type: MenuType): LayoutDefinition[] {
  return MENU_LAYOUTS.filter((l) => l.menuTypes.includes(type));
}

export function getLayoutDefinition(id: MenuLayout): LayoutDefinition {
  return MENU_LAYOUTS.find((l) => l.id === id) ?? MENU_LAYOUTS[0];
}
