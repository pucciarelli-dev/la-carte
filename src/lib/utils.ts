import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatAllergenNumbers as formatAllergenNumbersImpl } from "@/lib/allergens";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  value: number | string | null | undefined,
  currency = "€"
): string {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return `${currency}${num.toFixed(2).replace(".", ",")}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Spaced uppercase letters like BISTROT PDF titles */
export function spacedTitle(text: string): string {
  return text.toUpperCase().split("").join(" ");
}

export function formatBistrotPrice(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  const amount =
    Number.isInteger(num) || num % 1 === 0
      ? String(Math.round(num))
      : num.toFixed(2).replace(".", ",");
  return `€ ${amount}`;
}

export function formatAllergenNumbers(allergens: string[]): string {
  return formatAllergenNumbersImpl(allergens);
}
