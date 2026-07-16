const MENU_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugifyMenuName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function normalizeMenuSlug(slug: string): string {
  return slugifyMenuName(slug);
}

export function isValidMenuSlug(slug: string): boolean {
  return MENU_SLUG_PATTERN.test(slug) && slug.length >= 2 && slug.length <= 48;
}
