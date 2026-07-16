import { NextResponse } from "next/server";
import { resolveTenantFromRequest } from "@/lib/tenant";
import {
  getPublishedMenuSnapshot,
  getMenuBySlug,
} from "@/server/repositories/menu-repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await resolveTenantFromRequest();
  if (!tenant) {
    return NextResponse.json({ error: "Tenant non trovato" }, { status: 404 });
  }

  const menu = await getMenuBySlug(tenant.id, slug);
  if (!menu) {
    return NextResponse.json({ error: "Menu non trovato" }, { status: 404 });
  }

  const snapshot = await getPublishedMenuSnapshot(tenant.id, slug);
  if (!snapshot) {
    return NextResponse.json(
      { error: "Menu non ancora pubblicato" },
      { status: 404 }
    );
  }

  return NextResponse.json(snapshot);
}
