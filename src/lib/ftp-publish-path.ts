import type { MenuType } from "@prisma/client";

export function defaultStaticPublishPath(type: MenuType): string {
  switch (type) {
    case "DINNER":
      return "menu-dinner";
    case "WINE":
      return "menu-wine";
    case "DRINK":
      return "menu-drink";
    default:
      return "menu";
  }
}

/** Prefer an explicit path, then the menu slug, then the type default. */
export function resolveStaticPublishPath(input: {
  explicit?: string | null;
  slug?: string | null;
  type: MenuType;
}): string {
  const explicit = input.explicit?.trim();
  if (explicit) return normalizeStaticPublishPath(explicit);
  if (input.slug?.trim()) return normalizeStaticPublishPath(input.slug);
  return defaultStaticPublishPath(input.type);
}

export function normalizeStaticPublishPath(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidStaticPublishPath(value: string): boolean {
  const normalized = normalizeStaticPublishPath(value);
  return (
    normalized.length >= 2 &&
    normalized.length <= 80 &&
    /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/.test(normalized)
  );
}

export function buildPublicMenuUrl(
  publicBaseUrl: string,
  staticPublishPath: string
): string {
  const base = publicBaseUrl.replace(/\/+$/, "");
  const path = normalizeStaticPublishPath(staticPublishPath);
  // index.php bypasses Aruba directory HTML cache (Safari was stuck on HIT /menu-*/)
  return `${base}/${path}/index.php`;
}

export function buildPublicMenuUrlEn(
  publicBaseUrl: string,
  staticPublishPath: string
): string {
  const base = publicBaseUrl.replace(/\/+$/, "");
  const path = normalizeStaticPublishPath(staticPublishPath);
  return `${base}/${path}/en.php`;
}

export function joinFtpPath(...parts: string[]): string {
  return parts
    .map((part) => part.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}
