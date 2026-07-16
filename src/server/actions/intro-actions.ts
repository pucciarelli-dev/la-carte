"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  CATEGORY_IMAGE_LIMITS,
  getCategoryImageFilename,
  isAllowedCategoryImageMime,
} from "@/lib/category-image";
import type { MenuIntro } from "@/lib/menu-intro";

const introSchema = z.object({
  logoUrl: z.string().min(1).nullable().optional(),
  sectionLogoUrl: z.string().min(1).nullable().optional(),
  eyebrow: z.string().nullable().optional(),
  heroTitle: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  sectionTitle: z.string().nullable().optional(),
  bodyText: z.string().nullable().optional(),
  bodyImageUrl: z.string().min(1).nullable().optional(),
  bodyImageTagline: z.string().nullable().optional(),
  bodyTextSecondary: z.string().nullable().optional(),
  eyebrowEn: z.string().nullable().optional(),
  heroTitleEn: z.string().nullable().optional(),
  sectionTitleEn: z.string().nullable().optional(),
  bodyTextEn: z.string().nullable().optional(),
  bodyImageTaglineEn: z.string().nullable().optional(),
  bodyTextSecondaryEn: z.string().nullable().optional(),
  footerNoteIt: z.string().nullable().optional(),
  footerNoteEn: z.string().nullable().optional(),
});

type IntroLogoField = "logoUrl" | "sectionLogoUrl";

const INTRO_LOGO_CONFIG: Record<
  IntroLogoField,
  { basename: string; extensions: string[] }
> = {
  logoUrl: {
    basename: "intro-logo",
    extensions: ["jpg", "png", "webp", "gif"],
  },
  sectionLogoUrl: {
    basename: "intro-section-logo",
    extensions: ["jpg", "png", "webp", "gif"],
  },
};

function getCurrentIntro(menu: { intro: unknown }): Record<string, unknown> {
  return menu.intro && typeof menu.intro === "object"
    ? (menu.intro as Record<string, unknown>)
    : {};
}

export async function updateMenuIntroAction(menuId: string, data: unknown) {
  const session = await requireAuth();
  const parsed = introSchema.parse(data);

  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  const mergedIntro = { ...getCurrentIntro(menu), ...parsed };

  const updated = await prisma.menu.update({
    where: { id: menuId },
    data: { intro: mergedIntro as Prisma.InputJsonValue },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);
  return updated.intro as MenuIntro | null;
}

async function uploadIntroLogo(
  menuId: string,
  formData: FormData,
  field: IntroLogoField
) {
  const session = await requireAuth();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File mancante");
  }

  if (file.size > CATEGORY_IMAGE_LIMITS.imageBytes) {
    const limitMb = Math.round(CATEGORY_IMAGE_LIMITS.imageBytes / (1024 * 1024));
    throw new Error(`File troppo grande (max ${limitMb} MB)`);
  }

  if (!isAllowedCategoryImageMime(file.type)) {
    throw new Error("Formato file non supportato");
  }

  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  const config = INTRO_LOGO_CONFIG[field];
  const ext = getCategoryImageFilename(file.type).split(".").pop();
  const logoFilename = `${config.basename}.${ext}`;
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    session.user.tenantId,
    menuId
  );

  await mkdir(uploadDir, { recursive: true });

  await Promise.allSettled(
    config.extensions.map((extension) =>
      unlink(path.join(uploadDir, `${config.basename}.${extension}`))
    )
  );

  const filePath = path.join(uploadDir, logoFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const publicUrl = `/uploads/${session.user.tenantId}/${menuId}/${logoFilename}`;

  await prisma.menu.update({
    where: { id: menuId },
    data: {
      intro: {
        ...getCurrentIntro(menu),
        [field]: publicUrl,
      } as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);

  return { [field]: publicUrl } as Pick<MenuIntro, typeof field>;
}

async function removeIntroLogo(menuId: string, field: IntroLogoField) {
  const session = await requireAuth();
  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  const currentIntro = { ...getCurrentIntro(menu) };
  delete currentIntro[field];

  await prisma.menu.update({
    where: { id: menuId },
    data: { intro: currentIntro as Prisma.InputJsonValue },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);

  return { [field]: null } as Pick<MenuIntro, typeof field>;
}

export async function uploadMenuIntroLogoAction(
  menuId: string,
  formData: FormData
) {
  return uploadIntroLogo(menuId, formData, "logoUrl");
}

export async function removeMenuIntroLogoAction(menuId: string) {
  return removeIntroLogo(menuId, "logoUrl");
}

export async function uploadMenuIntroSectionLogoAction(
  menuId: string,
  formData: FormData
) {
  return uploadIntroLogo(menuId, formData, "sectionLogoUrl");
}

export async function removeMenuIntroSectionLogoAction(menuId: string) {
  return removeIntroLogo(menuId, "sectionLogoUrl");
}

const BODY_IMAGE_BASENAME = "intro-body-image";
const BODY_IMAGE_EXTENSIONS = ["jpg", "png", "webp", "gif"];

export async function uploadMenuIntroBodyImageAction(
  menuId: string,
  formData: FormData
) {
  const session = await requireAuth();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File mancante");
  }

  if (file.size > CATEGORY_IMAGE_LIMITS.imageBytes) {
    const limitMb = Math.round(CATEGORY_IMAGE_LIMITS.imageBytes / (1024 * 1024));
    throw new Error(`File troppo grande (max ${limitMb} MB)`);
  }

  if (!isAllowedCategoryImageMime(file.type)) {
    throw new Error("Formato file non supportato");
  }

  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  const ext = getCategoryImageFilename(file.type).split(".").pop();
  const imageFilename = `${BODY_IMAGE_BASENAME}.${ext}`;
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    session.user.tenantId,
    menuId
  );

  await mkdir(uploadDir, { recursive: true });

  await Promise.allSettled(
    BODY_IMAGE_EXTENSIONS.map((extension) =>
      unlink(path.join(uploadDir, `${BODY_IMAGE_BASENAME}.${extension}`))
    )
  );

  const filePath = path.join(uploadDir, imageFilename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const publicUrl = `/uploads/${session.user.tenantId}/${menuId}/${imageFilename}`;

  await prisma.menu.update({
    where: { id: menuId },
    data: {
      intro: {
        ...getCurrentIntro(menu),
        bodyImageUrl: publicUrl,
      } as Prisma.InputJsonValue,
    },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);

  return { bodyImageUrl: publicUrl };
}

export async function removeMenuIntroBodyImageAction(menuId: string) {
  const session = await requireAuth();
  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  const currentIntro = { ...getCurrentIntro(menu) };
  delete currentIntro.bodyImageUrl;

  await prisma.menu.update({
    where: { id: menuId },
    data: { intro: currentIntro as Prisma.InputJsonValue },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);

  return { bodyImageUrl: null };
}
