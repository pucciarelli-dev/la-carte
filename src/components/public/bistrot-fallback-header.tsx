import type { MenuTypography } from "@/lib/layouts";
import { fontFamilyStyle } from "@/lib/google-fonts";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import { cn, spacedTitle } from "@/lib/utils";
import type { TenantBranding } from "@/lib/layouts";
import { MENU_PRINT_PAGE_SECTION_CLASS } from "@/lib/menu-print";

interface BistrotFallbackHeaderProps {
  branding: TenantBranding;
  subtitle?: string | null;
  defaultSubtitle: string;
  typography: MenuTypography;
}

export function BistrotFallbackHeader({
  branding,
  subtitle,
  defaultSubtitle,
  typography,
}: BistrotFallbackHeaderProps) {
  return (
    <header className={cn(MENU_PRINT_PAGE_SECTION_CLASS, "pb-10 text-center")}>
      <p className={t.restaurantName}>
        {spacedTitle(branding.displayName)}
      </p>
      <h1
        className={t.menuTitle}
        style={fontFamilyStyle(typography.categoryFont, "serif")}
      >
        {spacedTitle(subtitle ?? defaultSubtitle)}
      </h1>
      {branding.address && (
        <p className={t.address}>{branding.address}</p>
      )}
    </header>
  );
}
