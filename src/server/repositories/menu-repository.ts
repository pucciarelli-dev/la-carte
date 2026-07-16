import type { MenuType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getTenantBranding } from "@/lib/branding";
import { DEFAULT_LAYOUT_BY_TYPE } from "@/lib/layouts";
import { normalizeTypography } from "@/lib/google-fonts";
import { parseMenuTypography } from "@/lib/typography";
import { parseMenuAllergenLegend,
  normalizeAllergenIds,
} from "@/lib/allergens";
import { parseMenuIntro } from "@/lib/menu-intro";
import type { MenuSnapshot, PublishedCategoryWithItems } from "@/types";

async function mergeLiveCategories(
  menuId: string,
  tenantId: string,
  snapshotCategories: PublishedCategoryWithItems[]
): Promise<PublishedCategoryWithItems[]> {
  const liveSnapshot = await buildMenuSnapshot(menuId, tenantId);
  const liveCategories = liveSnapshot.categories;

  const snapshotKey = snapshotCategories
    .map((category) => category.id)
    .sort()
    .join("|");
  const liveKey = liveCategories
    .map((category) => category.id)
    .sort()
    .join("|");

  if (snapshotKey !== liveKey) {
    return liveCategories;
  }

  const liveById = new Map(
    liveCategories.map((category) => [category.id, category])
  );

  return snapshotCategories.map((category) => {
    const live = liveById.get(category.id);
    return live ?? category;
  });
}

export async function getMenusByTenant(tenantId: string) {
  return prisma.menu.findMany({
    where: { tenantId },
    include: {
      publishedVersion: true,
      _count: { select: { versions: true, categories: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPublishedMenusForTenant(tenantId: string) {
  return prisma.menu.findMany({
    where: { tenantId, status: "PUBLISHED" },
    select: { slug: true, name: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getMenuByType(tenantId: string, type: MenuType) {
  return prisma.menu.findFirst({
    where: { tenantId, type },
    orderBy: { createdAt: "asc" },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          menuItems: { orderBy: { order: "asc" } },
          wineItems: { orderBy: { order: "asc" } },
          drinkItems: { orderBy: { order: "asc" } },
        },
      },
      publishedVersion: true,
      versions: { orderBy: { version: "desc" }, take: 10 },
    },
  });
}

export async function getMenuBySlug(tenantId: string, slug: string) {
  return prisma.menu.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          menuItems: { orderBy: { order: "asc" } },
          wineItems: { orderBy: { order: "asc" } },
          drinkItems: { orderBy: { order: "asc" } },
        },
      },
      publishedVersion: true,
      versions: { orderBy: { version: "desc" }, take: 10 },
    },
  });
}

export async function buildMenuSnapshot(
  menuId: string,
  tenantId: string
): Promise<MenuSnapshot> {
  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          menuItems: { orderBy: { order: "asc" } },
          wineItems: { orderBy: { order: "asc" } },
          drinkItems: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  const branding = await getTenantBranding(tenantId);

  return {
    menuId: menu.id,
    menuType: menu.type,
    menuName: menu.name,
    menuSlug: menu.slug,
    layout: menu.layout,
    subtitle: menu.subtitle,
    subtitleEn: menu.subtitleEn,
    typography: normalizeTypography(parseMenuTypography(menu.typography)),
    allergenLegend: parseMenuAllergenLegend(menu.allergenLegend),
    coverImageUrl: menu.coverImageUrl,
    coverVideoUrl: menu.coverVideoUrl,
    intro: parseMenuIntro(menu.intro),
    branding,
    publishedAt: new Date().toISOString(),
    version: 0,
    categories: menu.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      order: cat.order,
      visible: cat.visible,
      wineSortByPrice: cat.wineSortByPrice,
      backgroundColor: cat.backgroundColor,
      textColor: cat.textColor,
      footerImageUrl: cat.footerImageUrl,
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        description: item.description,
        descriptionEn: item.descriptionEn,
        price: item.price.toString(),
        order: item.order,
        visible: item.visible,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isSpicy: item.isSpicy,
        allergens: normalizeAllergenIds(item.allergens),
      })),
      wineItems: cat.wineItems.map((item) => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        producer: item.producer,
        vintage: item.vintage,
        region: item.region,
        regionEn: item.regionEn,
        subcategory: item.subcategory,
        subcategoryEn: item.subcategoryEn,
        description: item.description,
        descriptionEn: item.descriptionEn,
        glassPrice: item.glassPrice?.toString() ?? null,
        bottlePrice: item.bottlePrice?.toString() ?? null,
        order: item.order,
        visible: item.visible,
      })),
      drinkItems: cat.drinkItems.map((item) => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn,
        ingredients: item.ingredients,
        ingredientsEn: item.ingredientsEn,
        description: item.description,
        descriptionEn: item.descriptionEn,
        price: item.price.toString(),
        order: item.order,
        visible: item.visible,
      })),
    })),
  };
}

export async function publishMenu(menuId: string, tenantId: string, userId: string) {
  await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId },
  });

  const lastVersion = await prisma.menuVersion.findFirst({
    where: { menuId },
    orderBy: { version: "desc" },
  });

  const nextVersion = (lastVersion?.version ?? 0) + 1;
  const snapshot = await buildMenuSnapshot(menuId, tenantId);
  snapshot.version = nextVersion;

  const version = await prisma.menuVersion.create({
    data: {
      tenantId,
      menuId,
      version: nextVersion,
      snapshot: snapshot as unknown as Prisma.InputJsonValue,
      publishedBy: userId,
    },
  });

  await prisma.menu.update({
    where: { id: menuId },
    data: {
      status: "PUBLISHED",
      publishedVersionId: version.id,
    },
  });

  return version;
}

export async function restoreMenuVersion(
  versionId: string,
  tenantId: string
) {
  const version = await prisma.menuVersion.findFirstOrThrow({
    where: { id: versionId, tenantId },
  });

  const snapshot = version.snapshot as unknown as MenuSnapshot;

  await prisma.$transaction(async (tx) => {
    const menu = await tx.menu.findFirstOrThrow({
      where: { id: version.menuId, tenantId },
    });

    await tx.menuItem.deleteMany({ where: { category: { menuId: menu.id } } });
    await tx.wineItem.deleteMany({ where: { category: { menuId: menu.id } } });
    await tx.drinkItem.deleteMany({ where: { category: { menuId: menu.id } } });
    await tx.category.deleteMany({ where: { menuId: menu.id } });

    for (const cat of snapshot.categories) {
      const category = await tx.category.create({
        data: {
          tenantId,
          menuId: menu.id,
          name: cat.name,
          nameEn: cat.nameEn ?? "",
          order: cat.order,
          visible: cat.visible,
          backgroundColor: cat.backgroundColor ?? null,
          textColor: cat.textColor ?? null,
          footerImageUrl: cat.footerImageUrl ?? null,
        },
      });

      if (cat.menuItems?.length) {
        await tx.menuItem.createMany({
          data: cat.menuItems.map((item) => ({
            tenantId,
            categoryId: category.id,
            name: item.name,
            nameEn: item.nameEn ?? "",
            description: item.description,
            descriptionEn: item.descriptionEn ?? "",
            price: item.price,
            order: item.order,
            visible: item.visible,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            isGlutenFree: item.isGlutenFree,
            isSpicy: item.isSpicy,
            allergens: normalizeAllergenIds(item.allergens),
          })),
        });
      }

      if (cat.wineItems?.length) {
        await tx.wineItem.createMany({
          data: cat.wineItems.map((item) => ({
            tenantId,
            categoryId: category.id,
            name: item.name,
            nameEn: item.nameEn ?? "",
            producer: item.producer,
            vintage: item.vintage,
            region: item.region,
            regionEn: item.regionEn ?? "",
            subcategory: item.subcategory,
            subcategoryEn: item.subcategoryEn ?? "",
            description: item.description,
            descriptionEn: item.descriptionEn ?? "",
            glassPrice: item.glassPrice,
            bottlePrice: item.bottlePrice,
            order: item.order,
            visible: item.visible,
          })),
        });
      }

      if (cat.drinkItems?.length) {
        await tx.drinkItem.createMany({
          data: cat.drinkItems.map((item) => ({
            tenantId,
            categoryId: category.id,
            name: item.name,
            nameEn: item.nameEn ?? "",
            ingredients: item.ingredients,
            ingredientsEn: item.ingredientsEn ?? "",
            description: item.description,
            descriptionEn: item.descriptionEn ?? "",
            price: item.price,
            order: item.order,
            visible: item.visible,
          })),
        });
      }
    }

    await tx.menu.update({
      where: { id: menu.id },
      data: {
        status: "DRAFT",
        ...(snapshot.allergenLegend
          ? {
              allergenLegend:
                snapshot.allergenLegend as unknown as Prisma.InputJsonValue,
            }
          : {}),
        ...(snapshot.intro
          ? { intro: snapshot.intro as unknown as Prisma.InputJsonValue }
          : {}),
        ...(snapshot.subtitle !== undefined ? { subtitle: snapshot.subtitle } : {}),
        ...(snapshot.subtitleEn !== undefined
          ? { subtitleEn: snapshot.subtitleEn }
          : {}),
        ...(snapshot.coverImageUrl !== undefined
          ? { coverImageUrl: snapshot.coverImageUrl }
          : {}),
        ...(snapshot.coverVideoUrl !== undefined
          ? { coverVideoUrl: snapshot.coverVideoUrl }
          : {}),
      },
    });
  });

  return snapshot;
}

export async function getMenuPreviewSnapshot(
  tenantId: string,
  slug: string
): Promise<MenuSnapshot | null> {
  const menu = await prisma.menu.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
  });
  if (!menu) return null;
  return buildMenuSnapshot(menu.id, tenantId);
}

export async function getPublishedMenuSnapshot(
  tenantId: string,
  slug: string
): Promise<MenuSnapshot | null> {
  const menu = await prisma.menu.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: { publishedVersion: true },
  });

  if (!menu?.publishedVersion) return null;

  const snapshot = menu.publishedVersion
    .snapshot as unknown as Partial<MenuSnapshot>;
  const branding = snapshot.branding ?? (await getTenantBranding(tenantId));
  const categories = await mergeLiveCategories(
    menu.id,
    tenantId,
    snapshot.categories ?? []
  );

  return {
    ...snapshot,
    menuId: snapshot.menuId ?? menu.id,
    menuType: snapshot.menuType ?? menu.type,
    menuName: snapshot.menuName ?? menu.name,
    menuSlug: snapshot.menuSlug ?? menu.slug,
    layout: snapshot.layout ?? menu.layout ?? DEFAULT_LAYOUT_BY_TYPE[menu.type],
    subtitle: snapshot.subtitle ?? menu.subtitle,
    subtitleEn: snapshot.subtitleEn ?? menu.subtitleEn,
    typography: normalizeTypography(
      snapshot.typography ??
        parseMenuTypography(menu.typography) ??
        undefined
    ),
    allergenLegend: parseMenuAllergenLegend(
      snapshot.allergenLegend ?? menu.allergenLegend
    ),
    coverImageUrl: snapshot.coverImageUrl ?? menu.coverImageUrl,
    coverVideoUrl: snapshot.coverVideoUrl ?? menu.coverVideoUrl,
    intro: parseMenuIntro({
      ...(snapshot.intro && typeof snapshot.intro === "object"
        ? (snapshot.intro as Record<string, unknown>)
        : {}),
      ...(menu.intro && typeof menu.intro === "object"
        ? (menu.intro as Record<string, unknown>)
        : {}),
    }),
    branding,
    categories,
    publishedAt: snapshot.publishedAt ?? menu.publishedVersion.publishedAt.toISOString(),
    version: snapshot.version ?? menu.publishedVersion.version,
  } as MenuSnapshot;
}
