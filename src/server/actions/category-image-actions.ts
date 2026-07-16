"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  CATEGORY_IMAGE_LIMITS,
  getCategoryImageFilename,
  isAllowedCategoryImageMime,
} from "@/lib/category-image";

async function getCategoryWithMenu(categoryId: string, tenantId: string) {
  return prisma.category.findFirstOrThrow({
    where: { id: categoryId, tenantId },
    include: { menu: true },
  });
}

export async function uploadCategoryFooterImageAction(
  categoryId: string,
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

  const category = await getCategoryWithMenu(categoryId, session.user.tenantId);
  const filename = getCategoryImageFilename(file.type);
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    session.user.tenantId,
    category.menuId,
    "categories",
    categoryId
  );

  await mkdir(uploadDir, { recursive: true });

  const existingFiles = ["footer.jpg", "footer.png", "footer.webp", "footer.gif"];
  await Promise.allSettled(
    existingFiles.map((name) => unlink(path.join(uploadDir, name)))
  );

  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const publicUrl = `/uploads/${session.user.tenantId}/${category.menuId}/categories/${categoryId}/${filename}`;

  await prisma.category.update({
    where: { id: categoryId },
    data: { footerImageUrl: publicUrl },
  });

  revalidatePath(`/dashboard/menu/${category.menu.slug}`);
  revalidatePath(`/menu/${category.menu.slug}`);

  return { footerImageUrl: publicUrl };
}

export async function removeCategoryFooterImageAction(categoryId: string) {
  const session = await requireAuth();
  const category = await getCategoryWithMenu(categoryId, session.user.tenantId);

  await prisma.category.update({
    where: { id: categoryId },
    data: { footerImageUrl: null },
  });

  revalidatePath(`/dashboard/menu/${category.menu.slug}`);
  revalidatePath(`/menu/${category.menu.slug}`);

  return { footerImageUrl: null };
}
