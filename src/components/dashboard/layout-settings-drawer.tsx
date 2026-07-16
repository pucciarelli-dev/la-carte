"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { MenuLayout, MenuType } from "@prisma/client";
import { ExternalLink, Palette, Receipt, Type } from "lucide-react";
import { updateMenuLayoutAction, updateBrandingAction } from "@/server/actions/settings-actions";
import { updateMenuIntroAction } from "@/server/actions/intro-actions";
import {
  DEFAULT_MENU_SUBTITLES,
  type MenuTypography,
  type TenantBranding,
} from "@/lib/layouts";
import type { MenuIntro } from "@/lib/menu-intro";
import { getMenuIntroForForm } from "@/lib/menu-intro";
import {
  GOOGLE_FONTS,
  BISTROT_MENU_TYPOGRAPHY,
  DEFAULT_MENU_TYPOGRAPHY,
  buildGoogleFontsUrl,
  getUniqueFonts,
  normalizeTypography,
} from "@/lib/google-fonts";
import { FontSelect } from "@/components/dashboard/font-select";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import { withMenuLocale } from "@/lib/locale";
import { editorInputValue, localizedLabel } from "@/lib/editor-locale";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { MenuIntroSettings } from "@/components/dashboard/menu-intro-settings";
import { SettingsField, SettingsSection } from "@/components/dashboard/settings-section";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_NEWSLETTER_TEXT,
  DEFAULT_NEWSLETTER_TEXT_EN,
  DEFAULT_NEWSLETTER_LINK_LABEL,
  DEFAULT_NEWSLETTER_LINK_LABEL_EN,
} from "@/lib/menu-newsletter";
import { useSaveToast } from "@/components/dashboard/save-toast";

function getMenuTypographyDefault(layout: MenuLayout): MenuTypography {
  return layout.startsWith("BISTROT_")
    ? BISTROT_MENU_TYPOGRAPHY
    : DEFAULT_MENU_TYPOGRAPHY;
}

interface LayoutSettingsDrawerProps {
  menuId: string;
  menuSlug: string;
  menuType: MenuType;
  currentLayout: MenuLayout;
  currentSubtitle?: string | null;
  currentSubtitleEn?: string | null;
  currentTypography?: MenuTypography | null;
  currentCoverImageUrl?: string | null;
  currentCoverVideoUrl?: string | null;
  currentIntro?: MenuIntro | null;
  branding: TenantBranding;
}

export function LayoutSettingsDrawer({
  menuId,
  menuSlug,
  menuType,
  currentLayout,
  currentSubtitle,
  currentSubtitleEn,
  currentTypography,
  currentCoverImageUrl,
  currentCoverVideoUrl,
  currentIntro,
  branding,
}: LayoutSettingsDrawerProps) {
  const router = useRouter();
  const { locale } = useMenuEditorLanguage();
  const isEnglish = locale === "en";
  const [open, setOpen] = useState(false);
  const [subtitle, setSubtitle] = useState(
    currentSubtitle ?? DEFAULT_MENU_SUBTITLES[menuType]
  );
  const [subtitleEn, setSubtitleEn] = useState(currentSubtitleEn ?? "");
  const [typography, setTypography] = useState<MenuTypography>(
    normalizeTypography(
      currentTypography ?? getMenuTypographyDefault(currentLayout)
    )
  );
  const [coverImageUrl, setCoverImageUrl] = useState(currentCoverImageUrl ?? null);
  const [coverVideoUrl, setCoverVideoUrl] = useState(currentCoverVideoUrl ?? null);
  const [intro, setIntro] = useState<MenuIntro>(
    getMenuIntroForForm(currentIntro, branding, menuType)
  );
  const [footerNoteIt, setFooterNoteIt] = useState(
    currentIntro?.footerNoteIt?.trim() ?? ""
  );
  const [footerNoteEn, setFooterNoteEn] = useState(
    currentIntro?.footerNoteEn?.trim() ?? ""
  );
  const [newsletterText, setNewsletterText] = useState(
    branding.newsletterText?.trim() ?? ""
  );
  const [newsletterTextEn, setNewsletterTextEn] = useState(
    branding.newsletterTextEn?.trim() ?? ""
  );
  const [newsletterUrl, setNewsletterUrl] = useState(branding.newsletterUrl ?? "");
  const [newsletterLinkLabel, setNewsletterLinkLabel] = useState(
    branding.newsletterLinkLabel?.trim() ?? ""
  );
  const [newsletterLinkLabelEn, setNewsletterLinkLabelEn] = useState(
    branding.newsletterLinkLabelEn?.trim() ?? ""
  );
  const [isPending, startTransition] = useTransition();
  const { notifySaved, notifySavingStart, notifySavingEnd } = useSaveToast();

  useEffect(() => {
    if (open) return;

    setSubtitle(currentSubtitle ?? DEFAULT_MENU_SUBTITLES[menuType]);
    setSubtitleEn(currentSubtitleEn ?? "");
    setTypography(
      normalizeTypography(
        currentTypography ?? getMenuTypographyDefault(currentLayout)
      )
    );
    setCoverImageUrl(currentCoverImageUrl ?? null);
    setCoverVideoUrl(currentCoverVideoUrl ?? null);
    setIntro(getMenuIntroForForm(currentIntro, branding, menuType));
    setFooterNoteIt(currentIntro?.footerNoteIt?.trim() ?? "");
    setFooterNoteEn(currentIntro?.footerNoteEn?.trim() ?? "");
    setNewsletterText(branding.newsletterText?.trim() ?? "");
    setNewsletterTextEn(branding.newsletterTextEn?.trim() ?? "");
    setNewsletterUrl(branding.newsletterUrl ?? "");
    setNewsletterLinkLabel(branding.newsletterLinkLabel?.trim() ?? "");
    setNewsletterLinkLabelEn(branding.newsletterLinkLabelEn?.trim() ?? "");
  }, [
    currentSubtitle,
    currentSubtitleEn,
    currentTypography,
    currentCoverImageUrl,
    currentCoverVideoUrl,
    currentIntro,
    branding,
    menuType,
    currentLayout,
  ]);

  const fontsUrl = buildGoogleFontsUrl(getUniqueFonts(typography));

  const saveSettings = useCallback(async () => {
    notifySavingStart();
    try {
      await Promise.all([
        updateMenuLayoutAction(
          menuId,
          currentLayout,
          subtitle,
          typography,
          subtitleEn
        ),
        updateMenuIntroAction(menuId, {
          ...intro,
          footerNoteIt: footerNoteIt.trim() || null,
          footerNoteEn: footerNoteEn.trim() || null,
        }),
        updateBrandingAction({
          ...branding,
          newsletterText: newsletterText.trim(),
          newsletterTextEn: newsletterTextEn.trim() || undefined,
          newsletterUrl: newsletterUrl.trim() || undefined,
          newsletterLinkLabel: newsletterLinkLabel.trim() || undefined,
          newsletterLinkLabelEn: newsletterLinkLabelEn.trim() || undefined,
        }),
      ]);
      router.refresh();
      notifySaved("Impostazioni salvate");
    } catch (error) {
      notifySavingEnd();
      throw error;
    }
  }, [
    menuId,
    currentLayout,
    subtitle,
    typography,
    subtitleEn,
    intro,
    footerNoteIt,
    footerNoteEn,
    branding,
    newsletterText,
    newsletterTextEn,
    newsletterUrl,
    newsletterLinkLabel,
    newsletterLinkLabelEn,
    router,
    notifySaved,
    notifySavingStart,
    notifySavingEnd,
  ]);

  const handleSave = () => {
    startTransition(async () => {
      await saveSettings();
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && open) {
      startTransition(async () => {
        await saveSettings();
      });
    }
    setOpen(next);
  };

  const updateFont = (key: keyof MenuTypography, value: string) => {
    setTypography((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4" />
          Aspetto menu
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-[min(32rem,92vw)] max-w-lg flex-col gap-0 p-0">
        <SheetHeader className="px-6 pb-5 pt-6 pr-12">
          <SheetTitle>Aspetto menu</SheetTitle>
          <SheetDescription>
            Personalizza copertina, intro e tipografia del menu pubblico.
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-4 px-4 py-4 sm:px-5">
          <MenuIntroSettings
            menuId={menuId}
            intro={intro}
            onChange={setIntro}
            subtitle={subtitle}
            onSubtitleChange={setSubtitle}
            subtitleEn={subtitleEn}
            onSubtitleEnChange={setSubtitleEn}
            subtitlePlaceholder={DEFAULT_MENU_SUBTITLES[menuType]}
            coverImageUrl={coverImageUrl}
            coverVideoUrl={coverVideoUrl}
            onCoverChange={({ coverImageUrl: image, coverVideoUrl: video }) => {
              setCoverImageUrl(image);
              setCoverVideoUrl(video);
            }}
          />

          <SettingsSection
            title="Footer"
            description="Coperto e newsletter in fondo al menu. La nota coperto è specifica per questo menu."
            icon={<Receipt className="h-4 w-4" />}
          >
            <SettingsField
              label={localizedLabel("Nota coperto", locale)}
              hint="Mostrata sotto il logo nel footer nero."
            >
              <Textarea
                id="drawer-footer-note"
                rows={3}
                value={editorInputValue(footerNoteIt, footerNoteEn, locale)}
                onChange={(e) =>
                  isEnglish
                    ? setFooterNoteEn(e.target.value)
                    : setFooterNoteIt(e.target.value)
                }
                placeholder="Il costo del coperto è di 3,5 euro a persona. Tutti i prezzi presenti nel menu sono in euro."
                className="resize-none"
              />
            </SettingsField>

            <SettingsField
              label={localizedLabel("Newsletter", locale)}
              hint="Sezione bianca sotto il footer nero. Lascia vuoto il testo per nasconderla."
            >
              <Textarea
                id="drawer-newsletter-text"
                rows={3}
                value={editorInputValue(newsletterText, newsletterTextEn, locale)}
                onChange={(e) =>
                  isEnglish
                    ? setNewsletterTextEn(e.target.value)
                    : setNewsletterText(e.target.value)
                }
                placeholder={
                  isEnglish ? DEFAULT_NEWSLETTER_TEXT_EN : DEFAULT_NEWSLETTER_TEXT
                }
                className="resize-none"
              />
            </SettingsField>

            <SettingsField
              label="Link newsletter"
              hint="URL della pagina di iscrizione (es. Mailchimp, Brevo)."
            >
              <Input
                id="drawer-newsletter-url"
                type="url"
                value={newsletterUrl}
                onChange={(e) => setNewsletterUrl(e.target.value)}
                placeholder="https://..."
              />
            </SettingsField>

            <SettingsField
              label={localizedLabel("Testo cliccabile", locale)}
              hint="Parte del messaggio che diventa link, se presente nel testo sopra."
            >
              <Input
                id="drawer-newsletter-link-label"
                value={editorInputValue(
                  newsletterLinkLabel,
                  newsletterLinkLabelEn,
                  locale
                )}
                onChange={(e) =>
                  isEnglish
                    ? setNewsletterLinkLabelEn(e.target.value)
                    : setNewsletterLinkLabel(e.target.value)
                }
                placeholder={
                  isEnglish
                    ? DEFAULT_NEWSLETTER_LINK_LABEL_EN
                    : DEFAULT_NEWSLETTER_LINK_LABEL
                }
              />
            </SettingsField>
          </SettingsSection>

          <SettingsSection
            title="Tipografia"
            description="Font Google per categorie, piatti e prezzi."
            icon={<Type className="h-4 w-4" />}
          >
            <div className="grid gap-4">
              <FontSelect
                id="drawer-categoryFont"
                label="Categoria"
                value={typography.categoryFont ?? "Inter"}
                onChange={(v) => updateFont("categoryFont", v)}
                fonts={GOOGLE_FONTS}
              />
              <FontSelect
                id="drawer-productFont"
                label="Nome prodotto"
                value={typography.productFont ?? "Inter"}
                onChange={(v) => updateFont("productFont", v)}
                fonts={GOOGLE_FONTS}
              />
              <FontSelect
                id="drawer-priceFont"
                label="Prezzo"
                value={typography.priceFont ?? "Inter"}
                onChange={(v) => updateFont("priceFont", v)}
                fonts={GOOGLE_FONTS}
              />
            </div>
          </SettingsSection>
        </SheetBody>

        <div className="border-t bg-background/95 px-4 py-4 backdrop-blur sm:px-5">
          <div className="flex flex-col gap-2">
            <Button onClick={handleSave} disabled={isPending} className="w-full">
              {isPending ? "Salvataggio..." : "Salva impostazioni"}
            </Button>
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <a
                href={withMenuLocale(`/menu/${menuSlug}?preview=true`, locale)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                Anteprima menu
              </a>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
