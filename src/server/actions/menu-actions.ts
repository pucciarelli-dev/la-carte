"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { MenuType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  categorySchema,
  menuItemSchema,
  wineItemSchema,
  drinkItemSchema,
  reorderSchema,
  createMenuSchema,
} from "@/lib/validations";
import { normalizeAllergenIds } from "@/lib/allergens";
import { getMenuDefaults } from "@/lib/menu-defaults";
import { normalizeMenuSlug } from "@/lib/menu-slug";
import {
  canonicalizeWineRegion,
  computeWineRegionInsertIndex,
  normalizeWineRegionKey,
} from "@/lib/wine-menu";
import {
  findTemplateMenuForType,
  cloneMenuFromTemplate,
  seedEmptyMenuStructure,
} from "@/lib/menu-clone";
import {
  createMenuVersion,
  activatePublishedVersion,
  restoreMenuVersion,
} from "@/server/repositories/menu-repository";

function revalidateMenuPaths(slug: string) {
  revalidatePath(`/dashboard/menu/${slug}`);
  revalidatePath(`/menu/${slug}`);
  revalidatePath(`/api/menu/${slug}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard", "layout");
}

export async function getDashboardMenusAction() {
  const session = await requireAuth();
  const menus = await prisma.menu.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
      _count: { select: { categories: true, versions: true } },
    },
  });

  return menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    type: menu.type,
    status: menu.status,
    categoryCount: menu._count.categories,
    versionCount: menu._count.versions,
  }));
}

// ─── Menus ──────────────────────────────────────────────────────────────────

export async function createMenuAction(data: unknown) {
  const session = await requireAuth();
  const input = z
    .object({
      name: z.string().min(1, "Nome obbligatorio").max(80),
      slug: z.string().optional(),
      type: z.enum(["DINNER", "WINE", "DRINK"]).default("DINNER"),
    })
    .parse(data);

  const slug = normalizeMenuSlug(input.slug?.trim() || input.name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 2) {
    throw new Error("Slug non valido");
  }

  const parsed = createMenuSchema.parse({
    name: input.name.trim(),
    slug,
    type: input.type,
  });

  const existing = await prisma.menu.findUnique({
    where: {
      tenantId_slug: {
        tenantId: session.user.tenantId,
        slug: parsed.slug,
      },
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Esiste già un menu con questo slug");
  }

  const defaults = getMenuDefaults(parsed.type);
  const template = await findTemplateMenuForType(
    session.user.tenantId,
    parsed.type
  );

  const menu = await prisma.$transaction(async (tx) => {
    const created = await tx.menu.create({
      data: {
        tenantId: session.user.tenantId,
        type: parsed.type,
        slug: parsed.slug,
        name: parsed.name.trim(),
        staticPublishPath: parsed.slug,
        layout: template?.layout ?? defaults.layout,
        subtitle: template?.subtitle ?? defaults.subtitle,
        typography: template?.typography ?? defaults.typography,
        allergenLegend: template?.allergenLegend ?? defaults.allergenLegend,
      },
    });

    return created;
  });

  if (template && template.slug !== parsed.slug) {
    await cloneMenuFromTemplate(session.user.tenantId, template, {
      id: menu.id,
      name: menu.name,
      slug: menu.slug,
      type: menu.type,
    });
  } else {
    await seedEmptyMenuStructure(
      session.user.tenantId,
      menu.id,
      parsed.type
    );
  }

  revalidateMenuPaths(menu.slug);
  return { id: menu.id, slug: menu.slug };
}

export async function deleteMenuAction(menuId: string) {
  const session = await requireAuth();

  const menu = await prisma.menu.findFirst({
    where: { id: menuId, tenantId: session.user.tenantId },
    select: { id: true, slug: true },
  });

  if (!menu) {
    throw new Error("Menu non trovato");
  }

  const menuCount = await prisma.menu.count({
    where: { tenantId: session.user.tenantId },
  });

  if (menuCount <= 1) {
    throw new Error("Devi avere almeno un menu");
  }

  await prisma.$transaction(async (tx) => {
    await tx.menu.update({
      where: { id: menuId },
      data: { publishedVersionId: null },
    });
    await tx.menu.delete({ where: { id: menuId } });
  });

  revalidateMenuPaths(menu.slug);
  return { success: true };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function createCategory(menuId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = categorySchema.parse(data);

  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  const maxOrder = await prisma.category.aggregate({
    where: { menuId },
    _max: { order: true },
  });

  const category = await prisma.category.create({
    data: {
      tenantId: session.user.tenantId,
      menuId,
      name: parsed.name,
      nameEn: parsed.nameEn ?? "",
      order: (maxOrder._max.order ?? -1) + 1,
      visible: parsed.visible,
      backgroundColor: parsed.backgroundColor ?? null,
      textColor: parsed.textColor ?? null,
      footerImageUrl: parsed.footerImageUrl ?? null,
    },
  });

  revalidateMenuPaths(menu.slug);
  return category;
}

export async function updateCategory(id: string, data: unknown) {
  const session = await requireAuth();
  const parsed = categorySchema.partial().parse(data);

  const category = await prisma.category.update({
    where: { id, tenantId: session.user.tenantId },
    data: parsed,
    include: { menu: true },
  });

  revalidateMenuPaths(category.menu.slug);
  return category;
}

export async function deleteCategory(id: string) {
  const session = await requireAuth();

  const category = await prisma.category.delete({
    where: { id, tenantId: session.user.tenantId },
    include: { menu: true },
  });

  revalidateMenuPaths(category.menu.slug);
  return { success: true };
}

export async function reorderCategories(menuId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = reorderSchema.parse(data);

  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  await prisma.$transaction(
    parsed.items.map((item) =>
      prisma.category.update({
        where: { id: item.id, tenantId: session.user.tenantId },
        data: { order: item.order },
      })
    )
  );

  revalidateMenuPaths(menu.slug);
  return { success: true };
}

// ─── Dinner items ───────────────────────────────────────────────────────────

export async function createMenuItem(categoryId: string, data: unknown) {
  const session = await requireAuth();
  const input =
    data && typeof data === "object"
      ? {
          ...(data as Record<string, unknown>),
          ...(Array.isArray((data as { allergens?: string[] }).allergens)
            ? {
                allergens: normalizeAllergenIds(
                  (data as { allergens: string[] }).allergens
                ),
              }
            : {}),
        }
      : data;
  const parsed = menuItemSchema.parse(input);

  const category = await prisma.category.findFirstOrThrow({
    where: { id: categoryId, tenantId: session.user.tenantId },
    include: { menu: true },
  });

  // Put the new item first (order 0) and shift siblings down.
  const item = await prisma.$transaction(async (tx) => {
    await tx.menuItem.updateMany({
      where: { categoryId },
      data: { order: { increment: 1 } },
    });

    return tx.menuItem.create({
      data: {
        tenantId: session.user.tenantId,
        categoryId,
        ...parsed,
        order: 0,
      },
    });
  });

  revalidateMenuPaths(category.menu.slug);
  return item;
}

export async function updateMenuItem(id: string, data: unknown) {
  const session = await requireAuth();
  const input =
    data && typeof data === "object"
      ? {
          ...(data as Record<string, unknown>),
          ...(Array.isArray((data as { allergens?: string[] }).allergens)
            ? {
                allergens: normalizeAllergenIds(
                  (data as { allergens: string[] }).allergens
                ),
              }
            : {}),
        }
      : data;
  const parsed = menuItemSchema.partial().parse(input);

  const item = await prisma.menuItem.update({
    where: { id, tenantId: session.user.tenantId },
    data: parsed,
    include: { category: { include: { menu: true } } },
  });

  revalidateMenuPaths(item.category.menu.slug);
  return item;
}

export async function deleteMenuItem(id: string) {
  const session = await requireAuth();

  const item = await prisma.menuItem.delete({
    where: { id, tenantId: session.user.tenantId },
    include: { category: { include: { menu: true } } },
  });

  revalidateMenuPaths(item.category.menu.slug);
  return { success: true };
}

export async function duplicateMenuItem(id: string) {
  const session = await requireAuth();

  const original = await prisma.menuItem.findFirstOrThrow({
    where: { id, tenantId: session.user.tenantId },
    include: { category: { include: { menu: true } } },
  });

  const maxOrder = await prisma.menuItem.aggregate({
    where: { categoryId: original.categoryId },
    _max: { order: true },
  });

  const item = await prisma.menuItem.create({
    data: {
      tenantId: session.user.tenantId,
      categoryId: original.categoryId,
      name: `${original.name} (copia)`,
      description: original.description,
      price: original.price,
      order: (maxOrder._max.order ?? -1) + 1,
      visible: original.visible,
      isVegetarian: original.isVegetarian,
      isVegan: original.isVegan,
      isGlutenFree: original.isGlutenFree,
      isSpicy: original.isSpicy,
      allergens: original.allergens,
    },
  });

  revalidateMenuPaths(original.category.menu.slug);
  return item;
}

export async function reorderMenuItems(categoryId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = reorderSchema.parse(data);

  const category = await prisma.category.findFirstOrThrow({
    where: { id: categoryId, tenantId: session.user.tenantId },
    include: { menu: true },
  });

  await prisma.$transaction(
    parsed.items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id, tenantId: session.user.tenantId },
        data: { order: item.order },
      })
    )
  );

  revalidateMenuPaths(category.menu.slug);
  return { success: true };
}

// ─── Wine items ─────────────────────────────────────────────────────────────

export async function createWineItem(categoryId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = wineItemSchema.parse(data);

  const category = await prisma.category.findFirstOrThrow({
    where: { id: categoryId, tenantId: session.user.tenantId },
    include: { menu: true },
  });

  const item = await prisma.$transaction(async (tx) => {
    const existing = await tx.wineItem.findMany({
      where: { categoryId },
      orderBy: { order: "asc" },
    });
    const subcategory = canonicalizeWineRegion(existing, parsed.subcategory);
    const insertOrder = computeWineRegionInsertIndex(existing, subcategory);

    await tx.wineItem.updateMany({
      where: { categoryId, order: { gte: insertOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.wineItem.create({
      data: {
        tenantId: session.user.tenantId,
        categoryId,
        ...parsed,
        subcategory,
        region: "",
        regionEn: "",
        order: insertOrder,
      },
    });
  });

  revalidateMenuPaths(category.menu.slug);
  return item;
}

export async function updateWineItem(id: string, data: unknown) {
  const session = await requireAuth();
  const parsed = wineItemSchema.partial().parse(data);

  const existing = await prisma.wineItem.findFirstOrThrow({
    where: { id, tenantId: session.user.tenantId },
    include: { category: { include: { menu: true } } },
  });

  const nextSubcategory = canonicalizeWineRegion(
    await prisma.wineItem.findMany({
      where: { categoryId: existing.categoryId },
      orderBy: { order: "asc" },
    }),
    parsed.subcategory !== undefined ? parsed.subcategory : existing.subcategory
  );
  const regionChanged =
    normalizeWineRegionKey(nextSubcategory) !==
    normalizeWineRegionKey(existing.subcategory);

  if (regionChanged) {
    await prisma.$transaction(async (tx) => {
      const siblings = await tx.wineItem.findMany({
        where: { categoryId: existing.categoryId },
        orderBy: { order: "asc" },
      });
      const others = siblings.filter((item) => item.id !== id);
      const insertIndex = computeWineRegionInsertIndex(others, nextSubcategory);
      const reordered = [
        ...others.slice(0, insertIndex),
        { ...existing, ...parsed, subcategory: nextSubcategory },
        ...others.slice(insertIndex),
      ];

      for (const [index, row] of reordered.entries()) {
        await tx.wineItem.update({
          where: { id: row.id },
          data: {
            order: index,
            ...(row.id === id
              ? { ...parsed, subcategory: nextSubcategory, region: "", regionEn: "" }
              : {}),
          },
        });
      }
    });
  } else if (parsed.subcategory !== undefined && nextSubcategory !== parsed.subcategory) {
    await prisma.wineItem.update({
      where: { id, tenantId: session.user.tenantId },
      data: { ...parsed, subcategory: nextSubcategory, region: "", regionEn: "" },
    });
  } else {
    await prisma.wineItem.update({
      where: { id, tenantId: session.user.tenantId },
      data: parsed,
    });
  }

  revalidateMenuPaths(existing.category.menu.slug);
  return prisma.wineItem.findFirstOrThrow({
    where: { id, tenantId: session.user.tenantId },
  });
}

export async function deleteWineItem(id: string) {
  const session = await requireAuth();

  const item = await prisma.wineItem.delete({
    where: { id, tenantId: session.user.tenantId },
    include: { category: { include: { menu: true } } },
  });

  revalidateMenuPaths(item.category.menu.slug);
  return { success: true };
}

export async function duplicateWineItem(id: string) {
  const session = await requireAuth();

  const original = await prisma.wineItem.findFirstOrThrow({
    where: { id, tenantId: session.user.tenantId },
    include: { category: { include: { menu: true } } },
  });

  const item = await prisma.$transaction(async (tx) => {
    const existing = await tx.wineItem.findMany({
      where: { categoryId: original.categoryId },
      orderBy: { order: "asc" },
    });
    const insertOrder = computeWineRegionInsertIndex(
      existing,
      original.subcategory
    );

    await tx.wineItem.updateMany({
      where: { categoryId: original.categoryId, order: { gte: insertOrder } },
      data: { order: { increment: 1 } },
    });

    return tx.wineItem.create({
      data: {
        tenantId: session.user.tenantId,
        categoryId: original.categoryId,
        name: `${original.name} (copia)`,
        nameEn: original.nameEn,
        producer: original.producer,
        vintage: original.vintage,
        region: "",
        regionEn: "",
        subcategory: original.subcategory,
        subcategoryEn: original.subcategoryEn,
        description: original.description,
        descriptionEn: original.descriptionEn,
        glassPrice: original.glassPrice,
        bottlePrice: original.bottlePrice,
        order: insertOrder,
        visible: original.visible,
      },
    });
  });

  revalidateMenuPaths(original.category.menu.slug);
  return item;
}

export async function reorderWineItems(categoryId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = reorderSchema.parse(data);

  const category = await prisma.category.findFirstOrThrow({
    where: { id: categoryId, tenantId: session.user.tenantId },
    include: { menu: true },
  });

  await prisma.$transaction(
    parsed.items.map((item) =>
      prisma.wineItem.update({
        where: { id: item.id, tenantId: session.user.tenantId },
        data: { order: item.order },
      })
    )
  );

  revalidateMenuPaths(category.menu.slug);
  return { success: true };
}

// ─── Drink items ────────────────────────────────────────────────────────────

export async function createDrinkItem(categoryId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = drinkItemSchema.parse(data);

  const category = await prisma.category.findFirstOrThrow({
    where: { id: categoryId, tenantId: session.user.tenantId },
    include: { menu: true },
  });

  // Put the new item first (order 0) and shift siblings down.
  const item = await prisma.$transaction(async (tx) => {
    await tx.drinkItem.updateMany({
      where: { categoryId },
      data: { order: { increment: 1 } },
    });

    return tx.drinkItem.create({
      data: {
        tenantId: session.user.tenantId,
        categoryId,
        ...parsed,
        order: 0,
      },
    });
  });

  revalidateMenuPaths(category.menu.slug);
  return item;
}

export async function updateDrinkItem(id: string, data: unknown) {
  const session = await requireAuth();
  const parsed = drinkItemSchema.partial().parse(data);

  const item = await prisma.drinkItem.update({
    where: { id, tenantId: session.user.tenantId },
    data: parsed,
    include: { category: { include: { menu: true } } },
  });

  revalidateMenuPaths(item.category.menu.slug);
  return item;
}

export async function deleteDrinkItem(id: string) {
  const session = await requireAuth();

  const item = await prisma.drinkItem.delete({
    where: { id, tenantId: session.user.tenantId },
    include: { category: { include: { menu: true } } },
  });

  revalidateMenuPaths(item.category.menu.slug);
  return { success: true };
}

export async function duplicateDrinkItem(id: string) {
  const session = await requireAuth();

  const original = await prisma.drinkItem.findFirstOrThrow({
    where: { id, tenantId: session.user.tenantId },
    include: { category: { include: { menu: true } } },
  });

  const maxOrder = await prisma.drinkItem.aggregate({
    where: { categoryId: original.categoryId },
    _max: { order: true },
  });

  const item = await prisma.drinkItem.create({
    data: {
      tenantId: session.user.tenantId,
      categoryId: original.categoryId,
      name: `${original.name} (copia)`,
      ingredients: original.ingredients,
      description: original.description,
      price: original.price,
      order: (maxOrder._max.order ?? -1) + 1,
      visible: original.visible,
    },
  });

  revalidateMenuPaths(original.category.menu.slug);
  return item;
}

export async function reorderDrinkItems(categoryId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = reorderSchema.parse(data);

  const category = await prisma.category.findFirstOrThrow({
    where: { id: categoryId, tenantId: session.user.tenantId },
    include: { menu: true },
  });

  await prisma.$transaction(
    parsed.items.map((item) =>
      prisma.drinkItem.update({
        where: { id: item.id, tenantId: session.user.tenantId },
        data: { order: item.order },
      })
    )
  );

  revalidateMenuPaths(category.menu.slug);
  return { success: true };
}

// ─── Publish & versions ─────────────────────────────────────────────────────

export async function publishMenuAction(
  menuId: string,
  options?: { staticPublishPath?: string }
): Promise<{
  ok: boolean;
  version?: { id: string; version: number };
  ftpUploaded: boolean;
  publicUrl: string | null;
  remoteDir?: string | null;
  message: string;
}> {
  const session = await requireAuth();

  const existing = await prisma.menu.findFirst({
    where: { id: menuId, tenantId: session.user.tenantId },
    select: { id: true, slug: true, type: true, staticPublishPath: true },
  });
  if (!existing) {
    return {
      ok: false,
      ftpUploaded: false,
      publicUrl: null,
      message: "Menu non trovato",
    };
  }

  const {
    resolveStaticPublishPath,
    isValidStaticPublishPath,
    buildPublicMenuUrl,
  } = await import("@/lib/ftp-publish-path");
  const { getFtpPublishSettings, isFtpConfigured } = await import(
    "@/lib/ftp-settings"
  );

  const publishPath = resolveStaticPublishPath({
    explicit: options?.staticPublishPath,
    slug: existing.slug,
    type: existing.type,
  });

  if (!isValidStaticPublishPath(publishPath)) {
    return {
      ok: false,
      ftpUploaded: false,
      publicUrl: null,
      message:
        "Percorso pubblicazione non valido. Usa solo lettere, numeri, - e /.",
    };
  }

  if (publishPath !== existing.staticPublishPath) {
    await prisma.menu.update({
      where: { id: existing.id },
      data: { staticPublishPath: publishPath },
    });
  }

  const ftp = await getFtpPublishSettings(session.user.tenantId);
  const ftpReady = isFtpConfigured(ftp);

  let pendingVersion;
  try {
    pendingVersion = await createMenuVersion(
      menuId,
      session.user.tenantId,
      session.user.id
    );
  } catch (error) {
    return {
      ok: false,
      ftpUploaded: false,
      publicUrl: null,
      message:
        error instanceof Error
          ? `Impossibile creare la versione: ${error.message}`
          : "Impossibile creare la versione",
    };
  }

  if (ftpReady) {
    try {
      const { generateStaticMenuFiles } = await import(
        "@/lib/generate-static-menu"
      );
      const { uploadStaticMenuViaFtp } = await import("@/lib/ftp-upload");
      const files = await generateStaticMenuFiles({
        menuSlug: existing.slug,
        publishPath,
        ftp,
      });
      const uploaded = await uploadStaticMenuViaFtp({
        ftp,
        publishPath,
        files,
      });

      const version = await activatePublishedVersion(
        menuId,
        session.user.tenantId,
        pendingVersion.id
      );

      revalidateMenuPaths(existing.slug);
      revalidatePath("/dashboard");

      return {
        ok: true,
        version: { id: version.id, version: version.version },
        ftpUploaded: true,
        publicUrl: buildPublicMenuUrl(ftp.publicBaseUrl, publishPath),
        remoteDir: uploaded.remoteDir,
        message: `Menu pubblicato e caricato via FTP in ${uploaded.remoteDir}`,
      };
    } catch (error) {
      await prisma.menuVersion
        .delete({ where: { id: pendingVersion.id } })
        .catch(() => undefined);
      const detail =
        error instanceof Error ? error.message : "Errore sconosciuto FTP";
      return {
        ok: false,
        ftpUploaded: false,
        publicUrl: null,
        message: `Pubblicazione annullata: upload FTP fallito. Il menu online non è stato modificato. (${detail})`,
      };
    }
  }

  try {
    const version = await activatePublishedVersion(
      menuId,
      session.user.tenantId,
      pendingVersion.id
    );

    revalidateMenuPaths(existing.slug);
    revalidatePath("/dashboard");

    return {
      ok: true,
      version: { id: version.id, version: version.version },
      ftpUploaded: false,
      publicUrl: null,
      message:
        "Menu pubblicato su La Carte. Configura FTP in Impostazioni per caricarlo sul sito.",
    };
  } catch (error) {
    return {
      ok: false,
      ftpUploaded: false,
      publicUrl: null,
      message:
        error instanceof Error
          ? `Attivazione versione fallita: ${error.message}`
          : "Attivazione versione fallita",
    };
  }
}

export async function updateMenuStaticPublishPathAction(
  menuId: string,
  staticPublishPath: string
) {
  const session = await requireAuth();
  const {
    normalizeStaticPublishPath,
    isValidStaticPublishPath,
  } = await import("@/lib/ftp-publish-path");

  const path = normalizeStaticPublishPath(staticPublishPath);
  if (!isValidStaticPublishPath(path)) {
    throw new Error(
      "Percorso non valido. Usa solo lettere, numeri, trattini e /."
    );
  }

  const menu = await prisma.menu.update({
    where: { id: menuId, tenantId: session.user.tenantId },
    data: { staticPublishPath: path },
    select: { slug: true, staticPublishPath: true },
  });

  revalidateMenuPaths(menu.slug);
  return menu;
}

export async function restoreVersionAction(versionId: string) {
  const session = await requireAuth();
  const snapshot = await restoreMenuVersion(
    versionId,
    session.user.tenantId
  );
  revalidatePath(`/dashboard/menu/${snapshot.menuSlug}`);
  revalidatePath(`/menu/${snapshot.menuSlug}`);
  return snapshot;
}

export async function setMenuPreviewStatus(menuId: string) {
  const session = await requireAuth();

  const menu = await prisma.menu.update({
    where: { id: menuId, tenantId: session.user.tenantId },
    data: { status: "PREVIEW" },
  });

  revalidateMenuPaths(menu.slug);
  return menu;
}

export async function getMenuVersions(menuId: string) {
  const session = await requireAuth();

  return prisma.menuVersion.findMany({
    where: { menuId, tenantId: session.user.tenantId },
    orderBy: { version: "desc" },
  });
}

export async function getAllCategories(tenantId: string, menuType?: MenuType) {
  const session = await requireAuth();
  if (session.user.tenantId !== tenantId) throw new Error("Unauthorized");

  return prisma.category.findMany({
    where: {
      tenantId,
      ...(menuType ? { menu: { type: menuType } } : {}),
    },
    include: { menu: true },
    orderBy: [{ menu: { type: "asc" } }, { order: "asc" }],
  });
}
