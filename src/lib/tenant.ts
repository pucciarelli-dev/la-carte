import { headers } from "next/headers";
import { prisma } from "@/lib/db";

const DEFAULT_TENANT_SLUG =
  process.env.DEFAULT_TENANT_SLUG ?? "demo";

function isLocalHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1"
  );
}

export async function resolveTenantFromRequest() {
  const headersList = await headers();
  const forwardedHost =
    headersList.get("x-forwarded-host") ?? headersList.get("x-tenant-host");
  const host =
    forwardedHost ?? headersList.get("host") ?? "localhost:3000";
  const hostname = host.split(":")[0].trim().toLowerCase();

  // Local / internal publish capture → default tenant (skip IP-as-subdomain traps)
  if (isLocalHostname(hostname)) {
    return prisma.tenant.findUnique({
      where: { slug: DEFAULT_TENANT_SLUG },
    });
  }

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

  // Fallback for local / single-tenant deploys
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
