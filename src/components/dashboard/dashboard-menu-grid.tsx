"use client";

import { MenuDashboardCard } from "@/components/dashboard/menu-dashboard-card";
import { useDashboardMenus } from "@/components/dashboard/dashboard-menus";

export function DashboardMenuGrid() {
  const { menus } = useDashboardMenus();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <MenuDashboardCard key={menu.id} menu={menu} />
      ))}
    </div>
  );
}
