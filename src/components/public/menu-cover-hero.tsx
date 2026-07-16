import { cn } from "@/lib/utils";

interface MenuCoverHeroProps {
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  className?: string;
  variant?: "default" | "bistrot";
}

const coverBaseClass =
  "relative w-full overflow-hidden bg-neutral-900 [&_video]:menu-print-chrome";

const coverVariantClass = {
  default: "mb-8 aspect-video rounded-2xl",
  bistrot: "mb-10 aspect-[3/2] max-h-[72vh] rounded-none",
} as const;

const mediaClass = "block h-full w-full object-cover object-center";
const overlayClass =
  "pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.08] via-black/[0.02] via-45% to-black/[0.18]";

export function MenuCoverHero({
  coverImageUrl,
  coverVideoUrl,
  className,
  variant = "default",
}: MenuCoverHeroProps) {
  if (coverVideoUrl) {
    return (
      <div className={cn(coverBaseClass, "menu-cover-hero", coverVariantClass[variant], className)}>
        <video
          className={cn(mediaClass, "menu-print-chrome")}
          src={coverVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className={overlayClass} aria-hidden />
      </div>
    );
  }

  if (coverImageUrl) {
    return (
      <div className={cn(coverBaseClass, coverVariantClass[variant], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={mediaClass}
          src={coverImageUrl}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className={overlayClass} aria-hidden />
      </div>
    );
  }

  return null;
}
