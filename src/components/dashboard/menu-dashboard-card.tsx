"use client";

import Link from "next/link";
import type { MenuStatus, MenuType } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MenuStatusBadge } from "@/components/dashboard/menu-status-badge";
import { DeleteMenuButton } from "@/components/dashboard/delete-menu-button";
import { getMenuTypeIcon } from "@/lib/menu-icons";

interface MenuDashboardCardProps {
  menu: {
    id: string;
    name: string;
    slug: string;
    type: MenuType;
    status: MenuStatus;
    categoryCount: number;
    versionCount: number;
  };
}

export function MenuDashboardCard({ menu }: MenuDashboardCardProps) {
  const Icon = getMenuTypeIcon(menu.type);

  return (
    <Card className="relative transition-colors hover:border-foreground/20">
      <div className="absolute right-3 top-3 z-10">
        <DeleteMenuButton
          menuId={menu.id}
          menuName={menu.name}
          menuSlug={menu.slug}
        />
      </div>

      <Link href={`/dashboard/menu/${menu.slug}`} className="block">
        <CardHeader className="flex flex-row items-center justify-between pb-2 pr-12">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{menu.name}</CardTitle>
              <CardDescription>
                {menu.categoryCount} categorie · /menu/{menu.slug}
              </CardDescription>
            </div>
          </div>
          <MenuStatusBadge status={menu.status} />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{menu.versionCount} versioni pubblicate</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
