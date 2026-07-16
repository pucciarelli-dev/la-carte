import { MenuCoverHero } from "@/components/public/menu-cover-hero";
import { cn, spacedTitle } from "@/lib/utils";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";
import type { TenantBranding } from "@/lib/layouts";

interface BistrotHeaderProps {
  branding: TenantBranding;
  subtitle: string;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  showTagline?: boolean;
  className?: string;
}

export function BistrotHeader({
  branding,
  subtitle,
  coverImageUrl,
  coverVideoUrl,
  showTagline = true,
  className,
}: BistrotHeaderProps) {
  return (
    <div className={cn(className)}>
      <MenuCoverHero
        coverImageUrl={coverImageUrl}
        coverVideoUrl={coverVideoUrl}
      />
      <header className="text-center">
      <p className={t.headerRestaurant}>
        {spacedTitle(branding.displayName)}
      </p>
      {showTagline && branding.tagline && (
        <p className={t.headerTagline}>
          {spacedTitle(branding.tagline)}
        </p>
      )}
      <h1 className={t.headerSubtitle}>
        {subtitle}
      </h1>
      {branding.address && (
        <p className={t.headerAddress}>
          {branding.address}
        </p>
      )}
      </header>
    </div>
  );
}
