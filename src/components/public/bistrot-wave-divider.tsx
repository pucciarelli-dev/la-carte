import { cn } from "@/lib/utils";

const WAVE_ICON = {
  black: "/images/bistrot-wave-divider-black.png",
  white: "/images/bistrot-wave-divider-white.png",
} as const;

interface BistrotWaveDividerProps {
  inverted?: boolean;
  className?: string;
}

export function BistrotWaveDivider({
  inverted = false,
  className,
}: BistrotWaveDividerProps) {
  return (
    <div className={cn("flex justify-center py-6", className)} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={inverted ? WAVE_ICON.white : WAVE_ICON.black}
        alt=""
        loading="eager"
        decoding="async"
        className="menu-section-image h-auto w-36 max-w-[min(100%,9rem)] object-contain sm:w-40"
      />
    </div>
  );
}
