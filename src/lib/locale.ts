export type MenuLocale = "it" | "en";

export const DEFAULT_MENU_LOCALE: MenuLocale = "it";
export const SUPPORTED_MENU_LOCALES: MenuLocale[] = ["it", "en"];

export function parseMenuLocale(value: unknown): MenuLocale {
  return value === "en" ? "en" : "it";
}

/** Testo localizzato: EN se disponibile, altrimenti fallback IT. */
export function localizedText(
  primary: string | null | undefined,
  secondary: string | null | undefined,
  locale: MenuLocale
): string {
  if (locale === "en") {
    const en = secondary?.trim();
    if (en) return en;
  }
  return primary?.trim() ?? "";
}

export function withMenuLocale(path: string, locale: MenuLocale): string {
  if (locale === DEFAULT_MENU_LOCALE) {
    return path.replace(/([?&])lang=en(&|$)/, "$1").replace(/[?&]$/, "");
  }
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=en`;
}

export const MENU_STATIC_TEXT = {
  frozenProduct: {
    it: "* Prodotto congelato",
    en: "* Frozen product",
  },
  frozenDisclaimer: {
    it: "I nostri prodotti possono essere abbattuti per conservare le proprietà organolettiche",
    en: "Our products may be blast-frozen to preserve their organoleptic properties",
  },
} as const;

export function staticMenuText(
  key: keyof typeof MENU_STATIC_TEXT,
  locale: MenuLocale
): string {
  return MENU_STATIC_TEXT[key][locale];
}
