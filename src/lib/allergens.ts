import { ALLERGEN_LEGEND, ALLERGEN_NUMBERS } from "@/lib/constants";

export interface MenuAllergenEntry {
  num: number;
  it: string;
  en: string;
  enabled: boolean;
}

export const DEFAULT_MENU_ALLERGENS: MenuAllergenEntry[] = ALLERGEN_LEGEND.map(
  (entry) => ({
    ...entry,
    enabled: true,
  })
);

export function parseMenuAllergenLegend(value: unknown): MenuAllergenEntry[] {
  if (!Array.isArray(value) || value.length === 0) {
    return DEFAULT_MENU_ALLERGENS;
  }

  const parsed = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const num = Number(record.num);
      if (!Number.isInteger(num) || num < 1 || num > 14) return null;

      return {
        num,
        it: typeof record.it === "string" ? record.it : "",
        en: typeof record.en === "string" ? record.en : "",
        enabled: record.enabled !== false,
      } satisfies MenuAllergenEntry;
    })
    .filter((entry): entry is MenuAllergenEntry => entry !== null);

  if (parsed.length === 0) return DEFAULT_MENU_ALLERGENS;

  const byNum = new Map(parsed.map((entry) => [entry.num, entry]));
  return DEFAULT_MENU_ALLERGENS.map((defaultEntry) => {
    const existing = byNum.get(defaultEntry.num);
    return existing ?? defaultEntry;
  });
}

/** Normalize legacy slug ids (eggs, milk) to number strings ("3", "7"). */
export function normalizeAllergenIds(allergens: string[]): string[] {
  const nums = allergens
    .map((allergen) => {
      if (/^([1-9]|1[0-4])$/.test(allergen)) return allergen;
      const mapped = ALLERGEN_NUMBERS[allergen];
      return mapped ? String(mapped) : null;
    })
    .filter((value): value is string => value !== null);

  return [...new Set(nums)].sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );
}

export function formatAllergenNumbers(allergens: string[]): string {
  const nums = normalizeAllergenIds(allergens)
    .map((value) => parseInt(value, 10))
    .filter((value) => value >= 1 && value <= 14);

  return nums.length ? nums.join(",") : "";
}

export function getAllergenEntry(
  legend: MenuAllergenEntry[],
  num: number
): MenuAllergenEntry | undefined {
  return legend.find((entry) => entry.num === num);
}

/** Lingua del menu pubblico */
export type { MenuLocale } from "@/lib/locale";
import type { MenuLocale } from "@/lib/locale";

export function getAllergenLegendTitle(locale: MenuLocale = "it"): string {
  return locale === "en" ? "Allergens" : "Allergeni";
}

export function getAllergenLabel(
  entry: Pick<MenuAllergenEntry, "it" | "en">,
  locale: MenuLocale = "it"
): string {
  return locale === "en" ? entry.en : entry.it;
}

export function formatAllergenLegendLine(
  entry: Pick<MenuAllergenEntry, "num" | "it" | "en">,
  locale: MenuLocale = "it"
): string {
  return `${entry.num} ${getAllergenLabel(entry, locale)}`;
}

export function describeAllergenNumbers(
  allergens: string[],
  legend: MenuAllergenEntry[],
  locale: MenuLocale = "it"
): string {
  return normalizeAllergenIds(allergens)
    .map((id) => {
      const entry = getAllergenEntry(legend, parseInt(id, 10));
      return entry ? `${id} · ${getAllergenLabel(entry, locale)}` : id;
    })
    .join(", ");
}

export function getEnabledAllergens(
  legend: MenuAllergenEntry[]
): MenuAllergenEntry[] {
  return legend.filter((entry) => entry.enabled);
}
