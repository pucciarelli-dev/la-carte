"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadMenuButtonProps {
  slug: string;
  preview?: boolean;
  className?: string;
}

function DownloadMenuButtonInner({
  slug,
  preview = false,
  className,
}: DownloadMenuButtonProps) {
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const handleDownload = async () => {
    const params = new URLSearchParams();

    if (preview) {
      params.set("preview", "true");
    } else {
      searchParams.forEach((value, key) => {
        if (key === "embed" || key === "view" || key === "pdf") return;
        params.set(key, value);
      });
    }

    const lang = searchParams.get("lang");
    if (lang === "en") params.set("lang", "en");

    setIsPending(true);
    try {
      const query = params.toString();
      const response = await fetch(
        `/api/menu/${slug}/pdf${query ? `?${query}` : ""}`
      );

      if (!response.ok) {
        let detail = "PDF non disponibile";
        try {
          const payload = (await response.json()) as { detail?: string; error?: string };
          detail = payload.detail || payload.error || detail;
        } catch {
          // ignore non-JSON errors
        }
        throw new Error(detail);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `menu-${slug}.pdf`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Non è stato possibile generare il PDF. Riprova tra poco.";
      window.alert(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => void handleDownload()}
      disabled={isPending}
      className={cn("menu-print-chrome", className)}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {isPending ? "Generazione..." : "Scarica PDF"}
    </Button>
  );
}

export function DownloadMenuButton({
  slug,
  preview = false,
  className,
}: DownloadMenuButtonProps) {
  return (
    <Suspense fallback={null}>
      <DownloadMenuButtonInner slug={slug} preview={preview} className={className} />
    </Suspense>
  );
}
