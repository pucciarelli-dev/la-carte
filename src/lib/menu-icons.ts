import type { MenuType } from "@prisma/client";
import {
  GlassWater,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";

export const MENU_TYPE_ICONS: Record<MenuType, LucideIcon> = {
  DINNER: UtensilsCrossed,
  WINE: Wine,
  DRINK: GlassWater,
};

export function getMenuTypeIcon(type: MenuType): LucideIcon {
  return MENU_TYPE_ICONS[type];
}
