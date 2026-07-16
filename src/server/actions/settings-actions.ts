"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { MenuLayout } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";
import {
  getTenantBranding,
  updateTenantBranding,
} from "@/lib/branding";
import type { TenantBranding, MenuTypography } from "@/lib/layouts";

const typographySchema = z.object({
  categoryFont: z.string().nullable().optional(),
  productFont: z.string().nullable().optional(),
  priceFont: z.string().nullable().optional(),
});

const brandingSchema = z.object({
  displayName: z.string().min(1),
  address: z.string().default(""),
  tagline: z.string().default(""),
  coverCharge: z.coerce.number().optional(),
  introText: z.string().optional(),
  introTextSecondary: z.string().optional(),
  introTextEn: z.string().optional(),
  showAllergenLegend: z.boolean().optional(),
  footerNoteIt: z.string().optional(),
  footerNoteEn: z.string().optional(),
  newsletterText: z.string().optional(),
  newsletterTextEn: z.string().optional(),
  newsletterUrl: z.string().optional(),
  newsletterLinkLabel: z.string().optional(),
  newsletterLinkLabelEn: z.string().optional(),
});

export async function getBrandingAction(): Promise<TenantBranding> {
  const session = await requireAuth();
  return getTenantBranding(session.user.tenantId);
}

export async function updateBrandingAction(data: unknown) {
  const session = await requireAuth();
  const parsed = brandingSchema.parse(data);
  await updateTenantBranding(session.user.tenantId, parsed);
  revalidatePath("/dashboard/settings");
  revalidatePath("/menu/dinner");
  revalidatePath("/menu/wine");
  revalidatePath("/menu/drink");
  return { success: true };
}

export async function updateMenuLayoutAction(
  menuId: string,
  layout: MenuLayout,
  subtitle?: string,
  typography?: MenuTypography,
  subtitleEn?: string
) {
  const session = await requireAuth();

  const parsedTypography = typography
    ? typographySchema.parse(typography)
    : undefined;

  const menu = await prisma.menu.update({
    where: { id: menuId, tenantId: session.user.tenantId },
    data: {
      layout,
      subtitle: subtitle ?? undefined,
      subtitleEn: subtitleEn ?? undefined,
      ...(parsedTypography ? { typography: parsedTypography } : {}),
    },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);
  return menu;
}

export async function updateMenuAllergenLegendAction(
  menuId: string,
  legend: unknown
) {
  const session = await requireAuth();
  const { menuAllergenLegendSchema } = await import("@/lib/validations");
  const { parseMenuAllergenLegend } = await import("@/lib/allergens");
  const parsed = menuAllergenLegendSchema.parse(legend);

  const menu = await prisma.menu.update({
    where: { id: menuId, tenantId: session.user.tenantId },
    data: { allergenLegend: parsed },
  });

  revalidatePath(`/dashboard/menu/${menu.slug}`);
  revalidatePath(`/menu/${menu.slug}`);
  return parseMenuAllergenLegend(parsed);
}

const ftpSettingsSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().min(1).max(65535).default(21),
  user: z.string().min(1),
  password: z.string().optional(),
  secure: z.boolean().default(true),
  remoteBasePath: z.string().default("."),
  publicBaseUrl: z.string().url(),
});

export async function getFtpSettingsAction() {
  const session = await requireAuth();
  const { getFtpPublishSettingsPublic } = await import("@/lib/ftp-settings");
  return getFtpPublishSettingsPublic(session.user.tenantId);
}

export async function updateFtpSettingsAction(data: unknown) {
  const session = await requireAuth();
  const parsed = ftpSettingsSchema.parse(data);
  const { updateFtpPublishSettings } = await import("@/lib/ftp-settings");
  const result = await updateFtpPublishSettings(session.user.tenantId, parsed);
  revalidatePath("/dashboard/settings");
  return result;
}
