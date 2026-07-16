import type { MenuType, MenuLayout } from "@prisma/client";
import type { TenantBranding, MenuTypography } from "@/lib/layouts";
import type { MenuAllergenEntry } from "@/lib/allergens";
import type { MenuIntro } from "@/lib/menu-intro";

export interface PublishedCategory {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  visible: boolean;
  wineSortByPrice?: boolean;
  backgroundColor?: string | null;
  textColor?: string | null;
  footerImageUrl?: string | null;
}

export interface PublishedMenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: string;
  order: number;
  visible: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  allergens: string[];
}

export interface PublishedWineItem {
  id: string;
  name: string;
  nameEn?: string;
  producer: string;
  vintage: string | null;
  region: string;
  regionEn?: string;
  subcategory: string;
  subcategoryEn?: string;
  description: string;
  descriptionEn?: string;
  glassPrice: string | null;
  bottlePrice: string | null;
  order: number;
  visible: boolean;
}

export interface PublishedDrinkItem {
  id: string;
  name: string;
  nameEn?: string;
  ingredients: string;
  ingredientsEn?: string;
  description: string;
  descriptionEn?: string;
  price: string;
  order: number;
  visible: boolean;
}

export interface PublishedCategoryWithItems extends PublishedCategory {
  menuItems?: PublishedMenuItem[];
  wineItems?: PublishedWineItem[];
  drinkItems?: PublishedDrinkItem[];
}

export interface MenuSnapshot {
  menuId: string;
  menuType: MenuType;
  menuName: string;
  menuSlug: string;
  layout: MenuLayout;
  subtitle?: string | null;
  subtitleEn?: string | null;
  typography: MenuTypography;
  allergenLegend?: MenuAllergenEntry[];
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  intro?: MenuIntro | null;
  branding: TenantBranding;
  categories: PublishedCategoryWithItems[];
  publishedAt: string;
  version: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }

  interface User {
    role?: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    tenantId?: string;
    tenantSlug?: string;
    tenantName?: string;
  }
}
