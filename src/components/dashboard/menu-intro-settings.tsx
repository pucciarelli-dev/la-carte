"use client";

import { useRef, useState, useTransition } from "react";
import {
  ImageIcon,
  LayoutTemplate,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { pressable } from "@/lib/ui-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MenuIntro } from "@/lib/menu-intro";
import {
  removeMenuIntroBodyImageAction,
  removeMenuIntroLogoAction,
  removeMenuIntroSectionLogoAction,
  uploadMenuIntroBodyImageAction,
  uploadMenuIntroLogoAction,
  uploadMenuIntroSectionLogoAction,
} from "@/server/actions/intro-actions";
import {
  SettingsField,
  SettingsSection,
} from "@/components/dashboard/settings-section";
import { MenuCoverFields } from "@/components/dashboard/menu-cover-uploader";
import { cn } from "@/lib/utils";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import {
  editorInputValue,
  localizedLabel,
} from "@/lib/editor-locale";

interface MenuIntroSettingsProps {
  menuId: string;
  intro: MenuIntro;
  onChange: (intro: MenuIntro | ((prev: MenuIntro) => MenuIntro)) => void;
  subtitle: string;
  onSubtitleChange: (value: string) => void;
  subtitleEn?: string;
  onSubtitleEnChange?: (value: string) => void;
  subtitlePlaceholder?: string;
  coverImageUrl?: string | null;
  coverVideoUrl?: string | null;
  onCoverChange: (cover: {
    coverImageUrl: string | null;
    coverVideoUrl: string | null;
  }) => void;
}

type IntroTextField = {
  itKey: keyof MenuIntro;
  enKey: keyof MenuIntro;
};

const HERO_TITLE_FIELD: IntroTextField = {
  itKey: "heroTitle",
  enKey: "heroTitleEn",
};

function MediaUploadCard({
  label,
  hint,
  previewUrl,
  disabled,
  onUpload,
  onRemove,
  previewClassName,
}: {
  label: string;
  hint?: string;
  previewUrl?: string | null;
  disabled?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  previewClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className={cn(
            "group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background transition hover:border-foreground/20",
            !previewUrl && "border-dashed",
            disabled && "pointer-events-none opacity-60"
          )}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn("h-full w-full object-contain", previewClassName)}
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground/40 transition group-hover:text-muted-foreground/70" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{label}</p>
          {hint && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className={cn(pressable, "h-8")}
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Carica
            </Button>
            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  pressable,
                  "h-8 text-destructive hover:text-destructive"
                )}
                disabled={disabled}
                onClick={onRemove}
              >
                <X className="h-3.5 w-3.5" />
                Rimuovi
              </Button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function MenuIntroSettings({
  menuId,
  intro,
  onChange,
  subtitle,
  onSubtitleChange,
  subtitleEn = "",
  onSubtitleEnChange,
  subtitlePlaceholder,
  coverImageUrl,
  coverVideoUrl,
  onCoverChange,
}: MenuIntroSettingsProps) {
  const { locale } = useMenuEditorLanguage();
  const isEnglish = locale === "en";
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const updateLocalizedIntroField = (
    itKey: keyof MenuIntro,
    enKey: keyof MenuIntro,
    value: string
  ) => {
    const key = isEnglish ? enKey : itKey;
    onChange((prev) => ({ ...prev, [key]: value || null }));
  };

  const introFieldValue = (itKey: keyof MenuIntro, enKey: keyof MenuIntro) =>
    editorInputValue(
      intro[itKey] as string | null | undefined,
      intro[enKey] as string | null | undefined,
      locale
    );

  const uploadLogo = (
    action: (
      menuId: string,
      formData: FormData
    ) => Promise<{ logoUrl?: string | null; sectionLogoUrl?: string | null }>,
    field: "logoUrl" | "sectionLogoUrl",
    file: File
  ) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await action(menuId, formData);
        onChange((prev) => ({ ...prev, [field]: result[field] ?? null }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Caricamento fallito");
      }
    });
  };

  const removeLogo = (
    action: (
      menuId: string
    ) => Promise<{ logoUrl?: string | null; sectionLogoUrl?: string | null }>,
    field: "logoUrl" | "sectionLogoUrl"
  ) => {
    setError(null);
    startTransition(async () => {
      try {
        await action(menuId);
        onChange((prev) => ({ ...prev, [field]: null }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rimozione fallita");
      }
    });
  };

  const handleUploadBodyImage = (file: File) => {
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    startTransition(async () => {
      try {
        const result = await uploadMenuIntroBodyImageAction(menuId, formData);
        onChange((prev) => ({ ...prev, bodyImageUrl: result.bodyImageUrl }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Caricamento fallito");
      }
    });
  };

  const handleRemoveBodyImage = () => {
    setError(null);
    startTransition(async () => {
      try {
        await removeMenuIntroBodyImageAction(menuId);
        onChange((prev) => ({ ...prev, bodyImageUrl: null }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rimozione fallito");
      }
    });
  };

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Hero e copertina"
        description="Media iniziale, logo, titolo, sottotitolo e indirizzo."
        icon={<Sparkles className="h-4 w-4" />}
      >
        <MenuCoverFields
          menuId={menuId}
          coverImageUrl={coverImageUrl}
          coverVideoUrl={coverVideoUrl}
          onChange={onCoverChange}
          disabled={isPending}
        />

        <MediaUploadCard
          label="Logo hero"
          hint="Sulla copertina e nel footer nero."
          previewUrl={intro.logoUrl}
          disabled={isPending}
          onUpload={(file) =>
            uploadLogo(uploadMenuIntroLogoAction, "logoUrl", file)
          }
          onRemove={() => removeLogo(removeMenuIntroLogoAction, "logoUrl")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField
            label={localizedLabel("Titolo", locale)}
            hint="Es. MENÙ"
          >
            <Input
              id="intro-hero-title"
              value={introFieldValue(
                HERO_TITLE_FIELD.itKey,
                HERO_TITLE_FIELD.enKey
              )}
              onChange={(e) =>
                updateLocalizedIntroField(
                  HERO_TITLE_FIELD.itKey,
                  HERO_TITLE_FIELD.enKey,
                  e.target.value
                )
              }
            />
          </SettingsField>
          <SettingsField
            label={localizedLabel("Sottotitolo", locale)}
            hint="Es. A LA CARTE"
          >
            <Input
              id="drawer-subtitle"
              value={editorInputValue(subtitle, subtitleEn, locale)}
              onChange={(e) =>
                isEnglish
                  ? onSubtitleEnChange?.(e.target.value)
                  : onSubtitleChange(e.target.value)
              }
              placeholder={subtitlePlaceholder}
            />
          </SettingsField>
        </div>

        <SettingsField label="Indirizzo">
          <Input
            id="intro-address"
            value={intro.address ?? ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, address: e.target.value || null }))
            }
          />
        </SettingsField>
      </SettingsSection>

      <SettingsSection
        title="Sezione testo"
        description="Blocco bianco sotto la copertina: logo, testi, immagine centrale e chiusura."
        icon={<LayoutTemplate className="h-4 w-4" />}
      >
        <MediaUploadCard
          label="Logo sezione"
          hint="Se assente, viene usato il logo hero."
          previewUrl={intro.sectionLogoUrl}
          disabled={isPending}
          onUpload={(file) =>
            uploadLogo(uploadMenuIntroSectionLogoAction, "sectionLogoUrl", file)
          }
          onRemove={() =>
            removeLogo(removeMenuIntroSectionLogoAction, "sectionLogoUrl")
          }
        />

        <SettingsField
          label={localizedLabel("Titolo sezione", locale)}
          hint="Una riga per riga, es. LA NOSTRA / IDEA DI CUCINA"
        >
          <Textarea
            id="intro-section-title"
            rows={2}
            value={introFieldValue("sectionTitle", "sectionTitleEn")}
            onChange={(e) =>
              updateLocalizedIntroField(
                "sectionTitle",
                "sectionTitleEn",
                e.target.value
              )
            }
            placeholder={"LA NOSTRA\nIDEA DI CUCINA"}
            className="resize-none"
          />
        </SettingsField>

        <SettingsField label={localizedLabel("Testo introduttivo", locale)}>
          <Textarea
            id="intro-body"
            rows={4}
            value={introFieldValue("bodyText", "bodyTextEn")}
            onChange={(e) =>
              updateLocalizedIntroField("bodyText", "bodyTextEn", e.target.value)
            }
            className="resize-none"
          />
        </SettingsField>

        <MediaUploadCard
          label="Immagine centrale"
          hint="Tra il primo e il secondo paragrafo."
          previewUrl={intro.bodyImageUrl}
          disabled={isPending}
          previewClassName="object-cover"
          onUpload={handleUploadBodyImage}
          onRemove={handleRemoveBodyImage}
        />

        <SettingsField
          label={localizedLabel("Tagline sotto immagine", locale)}
          hint="Bebas bold"
        >
          <Input
            id="intro-body-image-tagline"
            value={introFieldValue("bodyImageTagline", "bodyImageTaglineEn")}
            onChange={(e) =>
              updateLocalizedIntroField(
                "bodyImageTagline",
                "bodyImageTaglineEn",
                e.target.value
              )
            }
            placeholder="CONTEMPORARY DINING EXPERIENCE"
          />
        </SettingsField>

        <SettingsField label={localizedLabel("Secondo paragrafo", locale)}>
          <Textarea
            id="intro-body-secondary"
            rows={3}
            value={introFieldValue("bodyTextSecondary", "bodyTextSecondaryEn")}
            onChange={(e) =>
              updateLocalizedIntroField(
                "bodyTextSecondary",
                "bodyTextSecondaryEn",
                e.target.value
              )
            }
            className="resize-none"
          />
        </SettingsField>
      </SettingsSection>

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}
      {isPending && (
        <p className="text-center text-xs text-muted-foreground">
          Caricamento in corso...
        </p>
      )}
    </div>
  );
}
