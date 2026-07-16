import { prisma } from "@/lib/db";
import {
  DEFAULT_BRANDING,
  type TenantBranding,
} from "@/lib/layouts";

const BRANDING_KEY = "branding";

export async function getTenantBranding(
  tenantId: string
): Promise<TenantBranding> {
  const setting = await prisma.setting.findUnique({
    where: { tenantId_key: { tenantId, key: BRANDING_KEY } },
  });

  if (!setting?.value) return DEFAULT_BRANDING;
  return {
    ...DEFAULT_BRANDING,
    ...(setting.value as unknown as TenantBranding),
  };
}

export async function updateTenantBranding(
  tenantId: string,
  branding: Partial<TenantBranding>
) {
  const current = await getTenantBranding(tenantId);
  const merged = { ...current, ...branding };

  return prisma.setting.upsert({
    where: { tenantId_key: { tenantId, key: BRANDING_KEY } },
    update: { value: merged },
    create: { tenantId, key: BRANDING_KEY, value: merged },
  });
}
