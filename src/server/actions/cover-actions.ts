"use server";

import { revalidatePath } from "next/cache";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  getCoverFilename,
  isAllowedCoverMime,
  MENU_COVER_LIMITS,
  type MenuCoverKind,
} from "@/lib/menu-cover";

const coverUpdateSchema = z.object({
  coverImageUrl: z.string().min(1).nullable().optional(),
  coverVideoUrl: z.string().min(1).nullable().optional(),
});

export async function updateMenuCoverAction(
  menuId: string,
  data: { coverImageUrl?: string | null; coverVideoUrl?: string | null }
) {
  const session = await requireAuth();
  const parsed = coverUpdateSchema.parse(data);

  const menu = await prisma.menu.update({
    where: { id: menuId, tenantId: session.user.tenantId },
    data: {
      ...(parsed.coverImageUrl !== undefined
        ? { coverImageUrl: parsed.coverImageUrl }
        : {}),
      ...(parsed.coverVideoUrl !== undefined
        ? { coverVideoUrl: parsed.coverVideoUrl }
        : {}),
    },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);
  return {
    coverImageUrl: menu.coverImageUrl,
    coverVideoUrl: menu.coverVideoUrl,
  };
}

export async function uploadMenuCoverAction(
  menuId: string,
  formData: FormData
) {
  const session = await requireAuth();
  const kind = formData.get("kind");
  const file = formData.get("file");

  if (kind !== "image" && kind !== "video") {
    throw new Error("Tipo copertina non valido");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File mancante");
  }

  const coverKind = kind as MenuCoverKind;
  const maxBytes =
    coverKind === "image"
      ? MENU_COVER_LIMITS.imageBytes
      : MENU_COVER_LIMITS.videoBytes;

  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File troppo grande (max ${limitMb} MB)`);
  }

  if (!isAllowedCoverMime(coverKind, file.type)) {
    throw new Error("Formato file non supportato");
  }

  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  const filename = getCoverFilename(coverKind, file.type);
  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    session.user.tenantId,
    menuId
  );
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const publicUrl = `/uploads/${session.user.tenantId}/${menuId}/${filename}`;

  if (coverKind === "image") {
    const videoPath = path.join(uploadDir, "cover-video.mp4");
    const videoWebmPath = path.join(uploadDir, "cover-video.webm");
    await Promise.allSettled([
      unlink(videoPath),
      unlink(videoWebmPath),
    ]);

    await prisma.menu.update({
      where: { id: menuId },
      data: {
        coverImageUrl: publicUrl,
        coverVideoUrl: null,
      },
    });
  } else {
    const imagePaths = [
      path.join(uploadDir, "cover-image.jpg"),
      path.join(uploadDir, "cover-image.png"),
      path.join(uploadDir, "cover-image.webp"),
      path.join(uploadDir, "cover-image.gif"),
    ];
    await Promise.allSettled(imagePaths.map((imagePath) => unlink(imagePath)));

    await prisma.menu.update({
      where: { id: menuId },
      data: {
        coverVideoUrl: publicUrl,
        coverImageUrl: null,
      },
    });
  }

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);

  return {
    coverImageUrl: coverKind === "image" ? publicUrl : null,
    coverVideoUrl: coverKind === "video" ? publicUrl : null,
  };
}

export async function removeMenuCoverAction(menuId: string) {
  const session = await requireAuth();

  const menu = await prisma.menu.findFirstOrThrow({
    where: { id: menuId, tenantId: session.user.tenantId },
  });

  await prisma.menu.update({
    where: { id: menuId },
    data: {
      coverImageUrl: null,
      coverVideoUrl: null,
    },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);

  return { success: true };
}
