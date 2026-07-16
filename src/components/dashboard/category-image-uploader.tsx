"use client";

import { useRef, useState, useTransition } from "react";
import { ImageIcon, Upload, X } from "lucide-react";
import { pressable } from "@/lib/ui-motion";
import { Button } from "@/components/ui/button";
import {
  removeCategoryFooterImageAction,
  uploadCategoryFooterImageAction,
} from "@/server/actions/category-image-actions";
import { cn } from "@/lib/utils";
import { useSaveToast } from "@/components/dashboard/save-toast";

interface CategoryImageUploaderProps {
  categoryId: string;
  imageUrl?: string | null;
  onChange: (url: string | null) => void;
}

export function CategoryImageUploader({
  categoryId,
  imageUrl,
  onChange,
}: CategoryImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { notifySaved } = useSaveToast();

  const handleUpload = (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await uploadCategoryFooterImageAction(categoryId, formData);
        onChange(result.footerImageUrl);
        notifySaved("Immagine categoria aggiornata");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Caricamento fallito");
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      try {
        await removeCategoryFooterImageAction(categoryId);
        onChange(null);
        notifySaved("Immagine categoria rimossa");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rimozione fallita");
      }
    });
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-xs text-muted-foreground">Immagine fondo</span>

      <div
        className={cn(
          "flex h-7 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted/30",
          !imageUrl && "border-dashed"
        )}
        title={imageUrl ? "Anteprima immagine categoria" : "Nessuna immagine"}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(pressable, "h-7 px-2 text-xs")}
        disabled={isPending}
        title="JPG, PNG, WebP, GIF · max 5 MB"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-3 w-3" />
        Carica
      </Button>

      {imageUrl && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            pressable,
            "h-7 w-7 p-0 text-destructive hover:text-destructive"
          )}
          disabled={isPending}
          title="Rimuovi immagine"
          onClick={handleRemove}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Rimuovi immagine</span>
        </Button>
      )}

      {error && (
        <span className="min-w-0 truncate text-xs text-destructive">{error}</span>
      )}
    </div>
  );
}
