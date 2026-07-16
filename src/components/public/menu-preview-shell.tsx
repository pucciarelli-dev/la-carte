"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { DownloadMenuButton } from "@/components/public/download-menu-button";

type PreviewDevice = "mobile" | "desktop";

const MOBILE_WIDTH = 390;
const MOBILE_HEIGHT = 844;
const DESKTOP_MAX_WIDTH = 1280;

interface MenuPreviewShellProps {
  slug: string;
  src: string;
}

function buildPreviewSrc(baseSrc: string, device: PreviewDevice) {
  const separator = baseSrc.includes("?") ? "&" : "?";
  return `${baseSrc}${separator}view=${device}`;
}

export function MenuPreviewShell({ slug, src }: MenuPreviewShellProps) {
  const [device, setDevice] = useState<PreviewDevice>("mobile");
  const isMobile = device === "mobile";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#ececec]">
      <header className="sticky top-0 z-50 flex h-12 shrink-0 items-center justify-between gap-4 border-b border-black/10 bg-[#1a1a1a] px-4 text-white">
        <Link
          href={`/dashboard/menu/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-medium text-white/80 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna all&apos;editor
        </Link>

        <div
          className="flex items-center gap-1 rounded-lg bg-white/10 p-1"
          role="tablist"
          aria-label="Modalità anteprima"
        >
          <button
            type="button"
            role="tab"
            aria-selected={isMobile}
            onClick={() => setDevice("mobile")}
            className={cn(
              "inline-flex h-8 w-10 items-center justify-center rounded-md transition",
              isMobile
                ? "bg-white text-[#1a1a1a] shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            title="Vista mobile"
          >
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isMobile}
            onClick={() => setDevice("desktop")}
            className={cn(
              "inline-flex h-8 w-10 items-center justify-center rounded-md transition",
              !isMobile
                ? "bg-white text-[#1a1a1a] shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
            title="Vista desktop"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden items-center gap-5 sm:flex">
          <Suspense fallback={null}>
            <DownloadMenuButton
              slug={slug}
              preview
              className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            />
          </Suspense>
          <p className="text-xs text-amber-300/90">Anteprima — non pubblicato</p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 py-6 sm:px-8 sm:py-8">
        <div
          className={cn(
            "overflow-hidden bg-white shadow-2xl ring-1 ring-black/10 transition-all duration-300 ease-out",
            isMobile ? "rounded-[2rem]" : "w-full rounded-lg"
          )}
          style={
            isMobile
              ? {
                  width: MOBILE_WIDTH,
                  height: `min(${MOBILE_HEIGHT}px, calc(100vh - 7rem))`,
                }
              : {
                  width: "100%",
                  minWidth: 1024,
                  maxWidth: DESKTOP_MAX_WIDTH,
                  height: "calc(100vh - 7rem)",
                }
          }
        >
          <iframe
            key={device}
            src={buildPreviewSrc(src, device)}
            title="Anteprima menu"
            className="h-full w-full border-0 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
