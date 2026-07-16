import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth-utils";
import { getMenuBySlug } from "@/server/repositories/menu-repository";
import { parseMenuTypography } from "@/lib/typography";
import { parseMenuIntro } from "@/lib/menu-intro";
import { parseMenuAllergenLegend } from "@/lib/allergens";
import { getTenantBranding } from "@/lib/branding";
import { DinnerMenuEditor } from "@/components/dashboard/dinner-menu-editor";
import { WineMenuEditor } from "@/components/dashboard/wine-menu-editor";
import { DrinkMenuEditor } from "@/components/dashboard/drink-menu-editor";
import { PublishBar } from "@/components/dashboard/publish-bar";
import { MenuEditorShell } from "@/components/dashboard/menu-editor-shell";
import { MenuEditorLocaleBanner } from "@/components/dashboard/menu-editor-language";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuEditorPage({ params }: PageProps) {
  const { slug } = await params;

  const session = await requireAuth();
  const [menu, branding] = await Promise.all([
    getMenuBySlug(session.user.tenantId, slug),
    getTenantBranding(session.user.tenantId),
  ]);
  if (!menu) notFound();

  const versions = menu.versions.map((v) => ({
    id: v.id,
    version: v.version,
    publishedAt: v.publishedAt,
  }));

  return (
    <MenuEditorShell>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{menu.name}</h1>
          <p className="text-muted-foreground">
            Modifica il menu e pubblica quando sei pronto
          </p>
        </div>

        <PublishBar
        menuId={menu.id}
        menuSlug={menu.slug}
        menuName={menu.name}
        status={menu.status}
        versions={versions}
        layoutSettings={{
          menuType: menu.type,
          currentLayout: menu.layout,
          currentSubtitle: menu.subtitle,
          currentSubtitleEn: menu.subtitleEn,
          currentTypography: parseMenuTypography(menu.typography),
          currentCoverImageUrl: menu.coverImageUrl,
          currentCoverVideoUrl: menu.coverVideoUrl,
          currentIntro: parseMenuIntro(menu.intro),
          branding,
        }}
      />

      <MenuEditorLocaleBanner className="mb-6" />

      {menu.type === "DINNER" && (
        <DinnerMenuEditor
          menuId={menu.id}
          allergenLegend={parseMenuAllergenLegend(menu.allergenLegend)}
          categories={menu.categories.map((c) => ({
            ...c,
            menuItems: c.menuItems.map((i) => ({
              ...i,
              price: i.price.toString(),
            })),
          }))}
        />
      )}

      {menu.type === "WINE" && (
        <WineMenuEditor
          menuId={menu.id}
          categories={menu.categories.map((c) => ({
            ...c,
            wineItems: c.wineItems.map((i) => ({
              ...i,
              glassPrice: i.glassPrice?.toString() ?? null,
              bottlePrice: i.bottlePrice?.toString() ?? null,
            })),
          }))}
        />
      )}

      {menu.type === "DRINK" && (
        <DrinkMenuEditor
          menuId={menu.id}
          categories={menu.categories.map((c) => ({
            ...c,
            drinkItems: c.drinkItems.map((i) => ({
              ...i,
              price: i.price.toString(),
            })),
          }))}
        />
      )}
      </div>
    </MenuEditorShell>
  );
}
