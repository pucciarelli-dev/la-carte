"use client";

import {
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { editorCard } from "@/lib/ui-motion";
import type { EditorCategoryBase } from "@/components/dashboard/editor/types";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import { displayCategoryName } from "@/lib/editor-locale";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  category: EditorCategoryBase;
  itemCount: number;
  itemLabel: string;
  hiddenItemCount?: number;
  onOpen: () => void;
}

export function CategoryCard({
  category,
  itemCount,
  itemLabel,
  hiddenItemCount = 0,
  onOpen,
}: CategoryCardProps) {
  const { locale } = useMenuEditorLanguage();
  const displayName = displayCategoryName(category, locale);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        editorCard,
        "group w-full rounded-xl border bg-card p-4 text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      style={
        category.backgroundColor
          ? { borderLeftWidth: 4, borderLeftColor: category.backgroundColor }
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 transition-colors group-hover:bg-muted"
        >
          <Layers className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{displayName}</h3>
            {!category.visible && (
              <EyeOff className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            {category.visible && (
              <Eye className="h-3.5 w-3.5 shrink-0 text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {itemCount} {itemLabel}
            {hiddenItemCount > 0 && (
              <span className="text-amber-700">
                {" "}
                · {hiddenItemCount} nascost{hiddenItemCount === 1 ? "o" : "i"}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hiddenItemCount > 0 && (
            <Badge variant="warning" className="shrink-0">
              <EyeOff className="mr-1 h-3 w-3" />
              {hiddenItemCount}
            </Badge>
          )}
          {(category.backgroundColor || category.textColor) && (
            <div className="flex gap-1">
              {category.backgroundColor && (
                <span
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: category.backgroundColor }}
                />
              )}
              {category.textColor && (
                <span
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: category.textColor }}
                />
              )}
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}
