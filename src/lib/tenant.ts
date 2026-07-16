import { headers } from "next/headers";
import { prisma } from "@/lib/db";

const DEFAULT_TENANT_SLUG =
  process.env.DEFAULT_TENANT_SLUG ?? "demo";

export async function resolveTenantFromRequest() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const hostname = host.split(":")[0];

  // Custom domain
  const byDomain = await prisma.tenant.findFirst({
    where: { domain: hostname },
  });
  if (byDomain) return byDomain;

  // Subdomain: {slug}.carte.app or {slug}.localhost
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    const subdomain = parts[0];
    if (subdomain !== "www" && subdomain !== "app") {
      const bySubdomain = await prisma.tenant.findFirst({
        where: { subdomain },
      });
      if (bySubdomain) return bySubdomain;
    }
  }

  // Fallback for local dev
  return prisma.tenant.findUnique({
    where: { slug: DEFAULT_TENANT_SLUG },
  });
}

export async function requireTenant() {
  const tenant = await resolveTenantFromRequest();
  if (!tenant) {
    throw new Error("Tenant non trovato");
  }
  return tenant;
}
