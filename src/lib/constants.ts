import { MenuType } from "@prisma/client";

export const APP_NAME = "La Carte";
export const APP_TAGLINE = "Restaurant Menu CMS";

export const MENU_TYPE_LABELS: Record<MenuType, string> = {
  DINNER: "Menu Dinner",
  WINE: "Menu Wine",
  DRINK: "Menu Drink",
};

export const MENU_TYPE_SLUGS: Record<MenuType, string> = {
  DINNER: "dinner",
  WINE: "wine",
  DRINK: "drink",
};

export const MENU_SLUG_TO_TYPE: Record<string, MenuType> = {
  dinner: "DINNER",
  wine: "WINE",
  drink: "DRINK",
};

export const ALLERGEN_ICONS: Record<string, string> = {
  gluten: "Glutine",
  crustaceans: "Crostacei",
  eggs: "Uova",
  fish: "Pesce",
  peanuts: "Arachidi",
  soy: "Soia",
  milk: "Latte",
  nuts: "Frutta a guscio",
  celery: "Sedano",
  mustard: "Senape",
  sesame: "Sesamo",
  sulphites: "Solfiti",
  lupin: "Lupini",
  molluscs: "Molluschi",
};

/** EU allergen numbering as used in Bistrot PDF menus */
export const ALLERGEN_NUMBERS: Record<string, number> = {
  gluten: 1,
  crustaceans: 2,
  eggs: 3,
  fish: 4,
  peanuts: 5,
  soy: 6,
  milk: 7,
  nuts: 8,
  celery: 9,
  mustard: 10,
  sesame: 11,
  sulphites: 12,
  lupin: 13,
  molluscs: 14,
};

export const ALLERGEN_LEGEND: Array<{ num: number; it: string; en: string }> = [
  { num: 1, it: "Cereali contenenti glutine", en: "Cereals containing gluten" },
  { num: 2, it: "Crostacei e prodotti a base di crostacei", en: "Crustaceans and products thereof" },
  { num: 3, it: "Uova e prodotti a base di uova", en: "Eggs and products thereof" },
  { num: 4, it: "Pesce e prodotti a base di pesce", en: "Fish and products thereof" },
  { num: 5, it: "Arachidi e prodotti a base di arachidi", en: "Peanuts and products thereof" },
  { num: 6, it: "Soia e prodotti a base di soia", en: "Soybeans and products thereof" },
  { num: 7, it: "Latte e prodotti a base di latte (incluso lattosio)", en: "Milk and products thereof (including lactose)" },
  { num: 8, it: "Frutta a guscio", en: "Nuts namely almonds, hazelnuts, walnuts" },
  { num: 9, it: "Sedano e prodotti a base di sedano", en: "Celery and products thereof" },
  { num: 10, it: "Senape e prodotti a base di senape", en: "Mustard and products thereof" },
  { num: 11, it: "Semi di sesamo e prodotti a base di semi di sesamo", en: "Sesame seeds and products thereof" },
  { num: 12, it: "Anidride solforosa e solfiti", en: "Sulphur dioxide and sulphites" },
  { num: 13, it: "Lupini e prodotti a base di lupini", en: "Lupin and products thereof" },
  { num: 14, it: "Molluschi e prodotti a base di molluschi", en: "Molluscs and products thereof" },
];
