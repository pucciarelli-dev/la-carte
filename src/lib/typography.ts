import type { MenuTypography } from "@/lib/layouts";

export function parseMenuTypography(value: unknown): MenuTypography | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  return {
    categoryFont: typeof v.categoryFont === "string" ? v.categoryFont : null,
    productFont: typeof v.productFont === "string" ? v.productFont : null,
    priceFont: typeof v.priceFont === "string" ? v.priceFont : null,
  };
}
