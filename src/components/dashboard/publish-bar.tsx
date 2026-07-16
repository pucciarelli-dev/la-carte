"use client";

import { useMemo, useState } from "react";
import {
  publishMenuAction,
  setMenuPreviewStatus,
  restoreVersionAction,
} from "@/server/actions/menu-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Upload, History, RotateCcw, AlertTriangle } from "lucide-react";
import type { MenuLayout, MenuStatus, MenuType } from "@prisma/client";
import { MenuStatusBadge } from "@/components/dashboard/menu-status-badge";
import { LayoutSettingsDrawer } from "@/components/dashboard/layout-settings-drawer";
import { DeleteMenuButton } from "@/components/dashboard/delete-menu-button";
import type { MenuTypography, TenantBranding } from "@/lib/layouts";
import type { MenuIntro } from "@/lib/menu-intro";
import {
  DashboardLanguageSelect,
  useMenuEditorLanguage,
} from "@/components/dashboard/menu-editor-language";
import { useFlushMenuEditorSave } from "@/components/dashboard/menu-editor-save";
import { withMenuLocale } from "@/lib/locale";
import {
  buildPublicMenuUrl,
  defaultStaticPublishPath,
  normalizeStaticPublishPath,
} from "@/lib/ftp-publish-path";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PublishBarProps {
  menuId: string;
  menuSlug: string;
  menuName: string;
  menuType: MenuType;
  status: MenuStatus;
  staticPublishPath?: string | null;
  ftpPublicBaseUrl?: string | null;
  ftpConfigured?: boolean;
  versions: Array<{
    id: string;
    version: number;
    publishedAt: Date;
  }>;
  layoutSettings?: {
    menuType: MenuType;
    currentLayout: MenuLayout;
    currentSubtitle?: string | null;
    currentSubtitleEn?: string | null;
    currentTypography?: MenuTypography | null;
    currentCoverImageUrl?: string | null;
    currentCoverVideoUrl?: string | null;
    currentIntro?: MenuIntro | null;
    branding: TenantBranding;
  };
}

export function PublishBar({
  menuId,
  menuSlug,
  menuName,
  menuType,
  status,
  staticPublishPath,
  ftpPublicBaseUrl,
  ftpConfigured = false,
  versions,
  layoutSettings,
}: PublishBarProps) {
  const { locale } = useMenuEditorLanguage();
  const flushSave = useFlushMenuEditorSave();
  const [showHistory, setShowHistory] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [pathDraft, setPathDraft] = useState(
    staticPublishPath || defaultStaticPublishPath(menuType)
  );

  const publicBase =
    ftpPublicBaseUrl?.replace(/\/+$/, "") ||
    "https://bistrot.southgarage.com";

  const previewPublicUrl = useMemo(() => {
    try {
      return buildPublicMenuUrl(
        publicBase,
        normalizeStaticPublishPath(pathDraft)
      );
    } catch {
      return `${publicBase}/${pathDraft}/`;
    }
  }, [pathDraft, publicBase]);

  const handlePreview = async () => {
    setLoading("preview");
    try {
      await flushSave();
      await setMenuPreviewStatus(menuId);
      window.open(
        withMenuLocale(`/menu/${menuSlug}?preview=true`, locale),
        "_blank"
      );
    } finally {
      setLoading(null);
    }
  };

  const handlePublishConfirm = async () => {
    setLoading("publish");
    setPublishError(null);
    setPublishMessage(null);
    try {
      await flushSave();
      const result = await publishMenuAction(menuId, {
        staticPublishPath: pathDraft,
      });
      setPublishMessage(result.message);
      if (result.publicUrl) {
        setPublishMessage(`${result.message} → ${result.publicUrl}`);
      }
      setConfirmOpen(false);
      window.location.reload();
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : "Pubblicazione non riuscita"
      );
    } finally {
      setLoading(null);
    }
  };

  const handleRestore = async (versionId: string) => {
    setLoading(versionId);
    await restoreVersionAction(versionId);
    setLoading(null);
    window.location.reload();
  };

  return (
    <div className="sticky top-0 z-10 -mx-6 -mt-2 mb-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <MenuStatusBadge status={status} />
          <DashboardLanguageSelect />
        </div>

        <div className="flex items-center gap-2">
          {layoutSettings && (
            <LayoutSettingsDrawer
              menuId={menuId}
              menuSlug={menuSlug}
              menuType={layoutSettings.menuType}
              currentLayout={layoutSettings.currentLayout}
              currentSubtitle={layoutSettings.currentSubtitle}
              currentSubtitleEn={layoutSettings.currentSubtitleEn}
              currentTypography={layoutSettings.currentTypography}
              currentCoverImageUrl={layoutSettings.currentCoverImageUrl}
              currentCoverVideoUrl={layoutSettings.currentCoverVideoUrl}
              currentIntro={layoutSettings.currentIntro}
              branding={layoutSettings.branding}
            />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={!!loading}
          >
            <Eye className="h-4 w-4" />
            Anteprima
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setPublishError(null);
              setPublishMessage(null);
              setPathDraft(
                staticPublishPath || defaultStaticPublishPath(menuType)
              );
              setConfirmOpen(true);
            }}
            disabled={!!loading}
          >
            <Upload className="h-4 w-4" />
            Pubblica
          </Button>

          {versions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4" />
              Cronologia ({versions.length})
            </Button>
          )}

          <DeleteMenuButton
            menuId={menuId}
            menuName={menuName}
            menuSlug={menuSlug}
            variant="button"
          />
        </div>
      </div>

      {publishMessage && (
        <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">
          {publishMessage}
        </p>
      )}

      {showHistory && versions.length > 0 && (
        <div className="mt-3 rounded-lg border p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Versioni pubblicate
          </p>
          {versions.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                v{v.version} —{" "}
                {new Date(v.publishedAt).toLocaleString("it-IT")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(v.id)}
                disabled={!!loading}
              >
                <RotateCcw className="h-3 w-3" />
                Ripristina
              </Button>
            </div>
          ))}
        </div>
      )}

      <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Conferma pubblicazione</SheetTitle>
            <SheetDescription>
              Stai per pubblicare <strong>{menuName}</strong> e sovrascrivere i
              file sul sito pubblico.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div className="flex gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Attenzione</p>
                <p>
                  La pubblicazione aggiorna il menu online. Se FTP è configurato,
                  i file nella cartella remota verranno sostituiti. L’operazione
                  non è annullabile automaticamente.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="static-publish-path">
                Percorso sul sito (URL)
              </Label>
              <Input
                id="static-publish-path"
                value={pathDraft}
                onChange={(e) => setPathDraft(e.target.value)}
                placeholder={defaultStaticPublishPath(menuType)}
              />
              <p className="text-xs text-muted-foreground break-all">
                URL pubblico: {previewPublicUrl}
              </p>
              {!ftpConfigured && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  FTP non configurato: il menu sarà pubblicato solo su La Carte.
                  Configura FTP in Impostazioni.
                </p>
              )}
            </div>

            {publishError && (
              <p className="text-sm text-destructive">{publishError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={loading === "publish"}
              >
                Annulla
              </Button>
              <Button
                type="button"
                onClick={handlePublishConfirm}
                disabled={loading === "publish" || !pathDraft.trim()}
              >
                {loading === "publish"
                  ? "Pubblicazione..."
                  : "Conferma e pubblica"}
              </Button>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  );
}
