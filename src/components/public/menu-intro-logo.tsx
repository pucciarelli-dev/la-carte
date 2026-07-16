import { cn } from "@/lib/utils";
import { bistrotMenuTypography as t } from "@/lib/menu-typography";

interface MenuIntroLogoProps {
  logoUrl?: string | null;
  className?: string;
  inverted?: boolean;
}

export function MenuIntroLogo({
  logoUrl,
  className,
  inverted,
}: MenuIntroLogoProps) {
  if (!logoUrl) {
    return (
      <p
        className={cn(
          "font-serif text-3xl font-light tracking-wide sm:text-4xl",
          inverted ? "text-white" : "text-[#1c1c1c]",
          className
        )}
      >
        Logo
      </p>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      loading="eager"
      decoding="async"
      className={cn("menu-section-image", t.introLogo, className)}
    />
  );
}
