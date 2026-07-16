import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-utils";
import { resolveTenantFromRequest } from "@/lib/tenant";
import {
  getMenuPreviewSnapshot,
  getPublishedMenuSnapshot,
  getMenuBySlug,
} from "@/server/repositories/menu-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  const tenant = await resolveTenantFromRequest();
  if (!tenant || tenant.id !== session.user.tenantId) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
  }

  const menu = await getMenuBySlug(tenant.id, slug);
  if (!menu) {
    return NextResponse.json({ error: "Menu non trovato" }, { status: 404 });
  }

  const snapshot = preview
    ? await getMenuPreviewSnapshot(tenant.id, slug)
    : await getPublishedMenuSnapshot(tenant.id, slug);

  if (!snapshot) {
    return NextResponse.json(
      { error: preview ? "Menu non trovato" : "Menu non ancora pubblicato" },
      { status: 404 }
    );
  }

  const port = process.env.PORT || "3000";
  const pageUrl = new URL(`http://127.0.0.1:${port}/menu/${slug}`);
  pageUrl.searchParams.set("pdf", "1");
  if (preview) pageUrl.searchParams.set("preview", "true");
  if (lang === "en") pageUrl.searchParams.set("lang", "en");

  try {
    const { generateMenuPdf } = await import("@/lib/generate-menu-pdf");
    const pdf = await generateMenuPdf(pageUrl.toString());

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="menu-${slug}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    const detail =
      error instanceof Error ? error.message : "Errore sconosciuto";
    return NextResponse.json(
      { error: "Generazione PDF non riuscita", detail },
      { status: 500 }
    );
  }
}
