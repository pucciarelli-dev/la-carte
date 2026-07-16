"use client";

import { useState } from "react";
import {
  publishMenuAction,
  setMenuPreviewStatus,
  restoreVersionAction,
} from "@/server/actions/menu-actions";
import { Button } from "@/components/ui/button";
import { Eye, Upload, History, RotateCcw } from "lucide-react";
import type { MenuLayout, MenuStatus, MenuType } from "@prisma/client";
import { MenuStatusBadge } from "@/components/dashboard/menu-status-badge";
import { LayoutSettingsDrawer } from "@/components/dashboard/layout-settings-drawer";
import { DeleteMenuButton } from "@/components/dashboard/delete-menu-button";
import type { MenuTypography, TenantBranding } from "@/lib/layouts";
import type { MenuIntro } from "@/lib/menu-intro";
import { DashboardLanguageSelect, useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import { useFlushMenuEditorSave } from "@/components/dashboard/menu-editor-save";
import { withMenuLocale } from "@/lib/locale";

interface PublishBarProps {
  menuId: string;
  menuSlug: string;
  menuName: string;
  status: MenuStatus;
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
  status,
  versions,
  layoutSettings,
}: PublishBarProps) {
  const { locale } = useMenuEditorLanguage();
  const flushSave = useFlushMenuEditorSave();
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

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

  const handlePublish = async () => {
    setLoading("publish");
    await publishMenuAction(menuId);
    setLoading(null);
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
            onClick={handlePublish}
            disabled={!!loading}
          >
            <Upload className="h-4 w-4" />
            {loading === "publish" ? "Pubblicazione..." : "Pubblica"}
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
    </div>
  );
}
