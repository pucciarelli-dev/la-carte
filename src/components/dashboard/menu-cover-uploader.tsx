"use client";

import { useRef, useState, useTransition } from "react";
import { Film, ImageIcon, Trash2, Upload } from "lucide-react";
import { pressable } from "@/lib/ui-motion";
import { Button } from "@/components/ui/button";
import {
  removeMenuCoverAction,
  uploadMenuCoverAction,
} from "@/server/actions/cover-actions";
import { MENU_COVER_LIMITS } from "@/lib/menu-cover";
import {
  SettingsField,
  SettingsSection,
} from "@/components/dashboard/settings-section";
import { cn } from "@/lib/utils";
import { useSaveToast } from "@/components/dashboard/save-toast";

interface MenuCoverFieldsProps {
  menuId: string;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  onChange: (cover: {
    coverImageUrl: string | null;
    coverVideoUrl: string | null;
  }) => void;
  disabled?: boolean;
}

export function MenuCoverFields({
  menuId,
  coverImageUrl,
  coverVideoUrl,
  onChange,
  disabled: disabledProp,
}: MenuCoverFieldsProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { notifySaved } = useSaveToast();

  const disabled = disabledProp || isPending;
  const hasCover = Boolean(coverImageUrl || coverVideoUrl);

  const handleUpload = (kind: "image" | "video", file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("kind", kind);
    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await uploadMenuCoverAction(menuId, formData);
        onChange({
          coverImageUrl: result.coverImageUrl,
          coverVideoUrl: result.coverVideoUrl,
        });
        notifySaved("Copertina aggiornata");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Caricamento fallito");
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      await removeMenuCoverAction(menuId);
      onChange({ coverImageUrl: null, coverVideoUrl: null });
      notifySaved("Copertina rimossa");
    });
  };

  return (
    <SettingsField
      label="Copertina"
      hint="Immagine o video a tutto schermo. Il video ha priorità."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={cn(
            "mx-auto w-full max-w-48 shrink-0 overflow-hidden rounded-lg border bg-muted/20 sm:mx-0",
            !hasCover && "border-dashed"
          )}
        >
          {coverVideoUrl ? (
            <video
              src={coverVideoUrl}
              className="aspect-video max-h-28 w-full object-cover"
              muted
              loop
              playsInline
              autoPlay
            />
          ) : coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImageUrl}
              alt="Anteprima copertina"
              loading="lazy"
              decoding="async"
              className="aspect-video max-h-28 w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video max-h-28 flex-col items-center justify-center gap-1.5 px-3 text-center">
              <div className="rounded-full bg-muted p-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground">Nessuna copertina</p>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload("image", file);
              e.target.value = "";
            }}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload("video", file);
              e.target.value = "";
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={pressable}
              disabled={disabled}
              onClick={() => imageInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Immagine
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={pressable}
              disabled={disabled}
              onClick={() => videoInputRef.current?.click()}
            >
              <Film className="h-4 w-4" />
              Video
            </Button>
            {hasCover && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  pressable,
                  "text-destructive hover:text-destructive"
                )}
                disabled={disabled}
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
                Rimuovi
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Immagini fino a {MENU_COVER_LIMITS.imageBytes / (1024 * 1024)} MB ·
            Video fino a {MENU_COVER_LIMITS.videoBytes / (1024 * 1024)} MB
          </p>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </SettingsField>
  );
}

interface MenuCoverUploaderProps extends MenuCoverFieldsProps {}

export function MenuCoverUploader(props: MenuCoverUploaderProps) {
  return (
    <SettingsSection
      title="Copertina"
      description="Immagine o video a tutto schermo all'apertura del menu. Il video ha priorità."
      icon={<ImageIcon className="h-4 w-4" />}
    >
      <MenuCoverFields {...props} />
    </SettingsSection>
  );
}
