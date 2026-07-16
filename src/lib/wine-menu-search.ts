import type { WineItemData } from "@/components/dashboard/editor/wine-items-panel";

export function matchesWineItemSearch(
  item: WineItemData,
  query: string
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [
    item.name,
    item.nameEn,
    item.subcategory,
    item.subcategoryEn,
    item.producer,
    item.vintage,
    item.description,
    item.descriptionEn,
  ]
    .filter(Boolean)
    .some((field) => field!.toLowerCase().includes(normalized));
}

export function filterWineItems(
  items: WineItemData[],
  query: string
): WineItemData[] {
  return items.filter((item) => matchesWineItemSearch(item, query));
}
