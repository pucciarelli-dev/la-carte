import { requireAuth } from "@/lib/auth-utils";
import { getMenusByTenant } from "@/server/repositories/menu-repository";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SaveToastProvider } from "@/components/dashboard/save-toast";
import { DashboardMenusProvider } from "@/components/dashboard/dashboard-menus";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const menus = await getMenusByTenant(session.user.tenantId);

  const sidebarMenus = menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    type: menu.type,
    status: menu.status,
    categoryCount: menu._count.categories,
    versionCount: menu._count.versions,
  }));

  return (
    <SaveToastProvider>
      <DashboardMenusProvider initialMenus={sidebarMenus}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar tenantName={session.user.tenantName} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl p-6">{children}</div>
          </main>
        </div>
      </DashboardMenusProvider>
    </SaveToastProvider>
  );
}
