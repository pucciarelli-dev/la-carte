"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Users,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { navLinkActive, navLinkBase, navIcon } from "@/lib/ui-motion";
import { getMenuTypeIcon } from "@/lib/menu-icons";
import { useDashboardMenus } from "@/components/dashboard/dashboard-menus";
import { APP_NAME } from "@/lib/constants";

const secondaryNav = [
  { name: "Impostazioni", href: "/dashboard/settings", icon: Settings },
  { name: "Utenti", href: "/dashboard/users", icon: Users, disabled: true },
];

interface SidebarProps {
  tenantName: string;
}

export function Sidebar({ tenantName }: SidebarProps) {
  const pathname = usePathname();
  const { menus } = useDashboardMenus();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <UtensilsCrossed className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{APP_NAME}</p>
          <p className="truncate text-xs text-muted-foreground">{tenantName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <Link
          href="/dashboard"
          className={cn(
            navLinkBase,
            "group",
            pathname === "/dashboard"
              ? cn(
                  navLinkActive,
                  "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <LayoutDashboard className={navIcon} />
          Dashboard
        </Link>

        <Separator className="my-3" />

        <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {menus.map((menu) => {
          const href = `/dashboard/menu/${menu.slug}`;
          const Icon = getMenuTypeIcon(menu.type);
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={menu.slug}
              href={href}
              className={cn(
                navLinkBase,
                "group",
                isActive
                  ? cn(
                      navLinkActive,
                      "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={navIcon} />
              <span className="truncate">{menu.name}</span>
            </Link>
          );
        })}

        <Separator className="my-3" />

        <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Gestione
        </p>
        {secondaryNav.map((item) => {
          const isActive =
            !item.disabled && pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                navLinkBase,
                "group",
                item.disabled
                  ? "cursor-not-allowed opacity-40"
                  : isActive
                    ? cn(
                        navLinkActive,
                        "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              <item.icon className={navIcon} />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Esci
        </Button>
      </div>
    </aside>
  );
}
