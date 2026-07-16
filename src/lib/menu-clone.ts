import { mkdir, copyFile, access } from "fs/promises";
import path from "path";
import type { MenuType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { MENU_TYPE_SLUGS } from "@/lib/constants";
import { normalizeAllergenIds } from "@/lib/allergens";
import { getMenuDefaults } from "@/lib/menu-defaults";
import { parseMenuIntro } from "@/lib/menu-intro";

const MENU_CLONE_INCLUDE = {
  categories: {
    orderBy: { order: "asc" as const },
    include: {
      menuItems: { orderBy: { order: "asc" as const } },
      wineItems: { orderBy: { order: "asc" as const } },
      drinkItems: { orderBy: { order: "asc" as const } },
    },
  },
} satisfies Prisma.MenuInclude;

type TemplateMenu = Prisma.MenuGetPayload<{ include: typeof MENU_CLONE_INCLUDE }>;

export async function findTemplateMenuForType(
  tenantId: string,
  type: MenuType
): Promise<TemplateMenu | null> {
  const canonicalSlug = MENU_TYPE_SLUGS[type];

  const canonical = await prisma.menu.findFirst({
    where: { tenantId, type, slug: canonicalSlug },
    include: MENU_CLONE_INCLUDE,
  });
  if (canonical) return canonical;

  return prisma.menu.findFirst({
    where: { tenantId, type },
    orderBy: { createdAt: "asc" },
    include: MENU_CLONE_INCLUDE,
  });
}

export async function cloneMenuAssetUrl(
  tenantId: string,
  _sourceMenuId: string,
  targetMenuId: string,
  url: string | null | undefined
): Promise<string | null> {
  if (!url?.trim()) return null;

  const uploadsPrefix = `/uploads/${tenantId}/`;
  if (!url.startsWith(uploadsPrefix)) return url;

  const filename = path.basename(url);
  const sourcePath = path.join(process.cwd(), "public", url);
  const targetDir = path.join(
    process.cwd(),
    "public/uploads",
    tenantId,
    targetMenuId
  );
  const targetUrl = `/uploads/${tenantId}/${targetMenuId}/${filename}`;

  try {
    await access(sourcePath);
    await mkdir(targetDir, { recursive: true });
    await copyFile(sourcePath, path.join(targetDir, filename));
    return targetUrl;
  } catch {
    return null;
  }
}

async function cloneMenuIntro(
  tenantId: string,
  sourceMenuId: string,
  targetMenuId: string,
  intro: unknown
): Promise<Prisma.InputJsonValue | null> {
  const parsed = parseMenuIntro(intro);
  if (!parsed) return null;

  const [logoUrl, sectionLogoUrl, bodyImageUrl] = await Promise.all([
    cloneMenuAssetUrl(tenantId, sourceMenuId, targetMenuId, parsed.logoUrl),
    cloneMenuAssetUrl(
      tenantId,
      sourceMenuId,
      targetMenuId,
      parsed.sectionLogoUrl
    ),
    cloneMenuAssetUrl(tenantId, sourceMenuId, targetMenuId, parsed.bodyImageUrl),
  ]);

  return {
    ...parsed,
    logoUrl,
    sectionLogoUrl,
    bodyImageUrl,
  } as Prisma.InputJsonValue;
}

export async function cloneMenuFromTemplate(
  tenantId: string,
  template: TemplateMenu,
  target: { id: string; name: string; slug: string; type: MenuType }
) {
  const [coverImageUrl, coverVideoUrl, intro] = await Promise.all([
    cloneMenuAssetUrl(
      tenantId,
      template.id,
      target.id,
      template.coverImageUrl
    ),
    cloneMenuAssetUrl(
      tenantId,
      template.id,
      target.id,
      template.coverVideoUrl
    ),
    cloneMenuIntro(tenantId, template.id, target.id, template.intro),
  ]);

  await prisma.$transaction(async (tx) => {
    await tx.menu.update({
      where: { id: target.id },
      data: {
        layout: template.layout,
        subtitle: template.subtitle,
        subtitleEn: template.subtitleEn,
        typography: template.typography ?? undefined,
        allergenLegend: template.allergenLegend ?? undefined,
        coverImageUrl,
        coverVideoUrl,
        intro: intro ?? undefined,
      },
    });

    for (const category of template.categories) {
      const footerImageUrl = await cloneMenuAssetUrl(
        tenantId,
        template.id,
        target.id,
        category.footerImageUrl
      );

      const createdCategory = await tx.category.create({
        data: {
          tenantId,
          menuId: target.id,
          name: category.name,
          nameEn: category.nameEn,
          order: category.order,
          visible: category.visible,
          backgroundColor: category.backgroundColor,
          textColor: category.textColor,
          footerImageUrl,
        },
      });

      if (category.menuItems.length > 0) {
        await tx.menuItem.createMany({
          data: category.menuItems.map((item) => ({
            tenantId,
            categoryId: createdCategory.id,
            name: item.name,
            nameEn: item.nameEn,
            description: item.description,
            descriptionEn: item.descriptionEn,
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

      if (category.wineItems.length > 0) {
        await tx.wineItem.createMany({
          data: category.wineItems.map((item) => ({
            tenantId,
            categoryId: createdCategory.id,
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
            glassPrice: item.glassPrice,
            bottlePrice: item.bottlePrice,
            order: item.order,
            visible: item.visible,
          })),
        });
      }

      if (category.drinkItems.length > 0) {
        await tx.drinkItem.createMany({
          data: category.drinkItems.map((item) => ({
            tenantId,
            categoryId: createdCategory.id,
            name: item.name,
            nameEn: item.nameEn,
            ingredients: item.ingredients,
            ingredientsEn: item.ingredientsEn,
            description: item.description,
            descriptionEn: item.descriptionEn,
            price: item.price,
            order: item.order,
            visible: item.visible,
          })),
        });
      }
    }
  });
}

export async function seedEmptyMenuStructure(
  tenantId: string,
  menuId: string,
  type: MenuType
) {
  const defaults = getMenuDefaults(type);
  if (defaults.categories.length === 0) return;

  await prisma.category.createMany({
    data: defaults.categories.map((category) => ({
      tenantId,
      menuId,
      name: category.name,
      order: category.order,
      backgroundColor: category.backgroundColor ?? null,
      textColor: category.textColor ?? null,
    })),
  });
}
