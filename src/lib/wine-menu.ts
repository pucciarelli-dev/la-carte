import type { PublishedWineItem } from "@/types";

export const WINE_LIST_PAGE_SIZE = 10;

function parseWinePrice(value: string | null | undefined): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function getWineSortPrice(item: {
  bottlePrice: string | null;
  glassPrice: string | null;
}): number {
  return (
    parseWinePrice(item.bottlePrice) ??
    parseWinePrice(item.glassPrice) ??
    Number.POSITIVE_INFINITY
  );
}

function buildWineRegionFirstOrder<
  T extends { subcategory?: string | null; order?: number },
>(items: T[]): Map<string, number> {
  const regionFirstOrder = new Map<string, number>();

  for (let index = 0; index < items.length; index++) {
    const key = normalizeWineRegionKey(items[index].subcategory);
    if (!key || regionFirstOrder.has(key)) continue;
    regionFirstOrder.set(key, items[index].order ?? index);
  }

  return regionFirstOrder;
}

function compareWineItemsByPriceAndOrder<
  T extends {
    bottlePrice: string | null;
    glassPrice: string | null;
    order?: number;
  },
>(a: T, b: T): number {
  const priceDiff = getWineSortPrice(a) - getWineSortPrice(b);
  if (priceDiff !== 0) return priceDiff;
  return (a.order ?? 0) - (b.order ?? 0);
}

type WinePriceRegionBlock<
  T extends {
    bottlePrice: string | null;
    glassPrice: string | null;
    subcategory?: string | null;
    order?: number;
  },
> = {
  minPrice: number;
  sortOrder: number;
  items: T[];
};

export function sortWineItemsByPriceAsc<
  T extends {
    bottlePrice: string | null;
    glassPrice: string | null;
    subcategory?: string | null;
    order?: number;
  },
>(items: T[]): T[] {
  if (items.length <= 1) return [...items];

  const regionFirstOrder = buildWineRegionFirstOrder(items);
  const regionGroups = new Map<string, T[]>();

  for (const item of items) {
    const key = normalizeWineRegionKey(item.subcategory);
    if (!key) continue;

    const group = regionGroups.get(key);
    if (group) {
      group.push(item);
      continue;
    }
    regionGroups.set(key, [item]);
  }

  const blocks: WinePriceRegionBlock<T>[] = [];

  for (const [key, groupItems] of regionGroups) {
    const sortedItems = [...groupItems].sort(compareWineItemsByPriceAndOrder);
    blocks.push({
      minPrice: getWineSortPrice(sortedItems[0]),
      sortOrder: regionFirstOrder.get(key) ?? Number.POSITIVE_INFINITY,
      items: sortedItems,
    });
  }

  for (const item of items) {
    if (normalizeWineRegionKey(item.subcategory)) continue;
    blocks.push({
      minPrice: getWineSortPrice(item),
      sortOrder: item.order ?? Number.POSITIVE_INFINITY,
      items: [item],
    });
  }

  blocks.sort((a, b) => {
    if (a.minPrice !== b.minPrice) return a.minPrice - b.minPrice;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return compareWineItemsByPriceAndOrder(a.items[0], b.items[0]);
  });

  return blocks.flatMap((block) => block.items);
}

export function normalizeWineRegionKey(value: string | null | undefined): string {
  return value?.trim().toLocaleLowerCase("it") ?? "";
}

export function canonicalizeWineRegion<
  T extends { subcategory?: string | null },
>(items: T[], region: string | null | undefined): string {
  const trimmed = region?.trim() ?? "";
  if (!trimmed) return "";

  const key = normalizeWineRegionKey(trimmed);
  const match = items.find(
    (item) => normalizeWineRegionKey(item.subcategory) === key
  );

  return match?.subcategory?.trim() || trimmed;
}

export function computeWineRegionInsertIndex<
  T extends { subcategory?: string | null; order: number },
>(items: T[], region: string | null | undefined): number {
  const key = normalizeWineRegionKey(region);
  const sorted = [...items].sort((a, b) => a.order - b.order);

  if (!key) return sorted.length;

  const firstIndex = sorted.findIndex(
    (item) => normalizeWineRegionKey(item.subcategory) === key
  );
  if (firstIndex === -1) return sorted.length;

  let insertAt = firstIndex + 1;
  while (
    insertAt < sorted.length &&
    normalizeWineRegionKey(sorted[insertAt].subcategory) === key
  ) {
    insertAt += 1;
  }

  return insertAt;
}

export function groupWineItemsBySubcategory(items: PublishedWineItem[]) {
  const groups: { label: string; items: PublishedWineItem[] }[] = [];

  for (const item of items) {
    const label = item.subcategory?.trim() ?? "";
    const key = normalizeWineRegionKey(label);
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && normalizeWineRegionKey(lastGroup.label) === key) {
      lastGroup.items.push(item);
      continue;
    }

    groups.push({ label, items: [item] });
  }

  return groups;
}

export function mergeWineItemIntoOrderedList<
  T extends { id: string; subcategory?: string | null; order: number },
>(items: T[], item: T): T[] {
  const without = items.filter((row) => row.id !== item.id);
  const insertAt = computeWineRegionInsertIndex(without, item.subcategory);
  const next = [
    ...without.slice(0, insertAt),
    item,
    ...without.slice(insertAt),
  ];

  return next.map((row, index) => ({ ...row, order: index }));
}
