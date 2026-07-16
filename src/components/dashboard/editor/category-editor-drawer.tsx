"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryColorPicker } from "@/components/dashboard/category-color-picker";
import { CategoryImageUploader } from "@/components/dashboard/category-image-uploader";
import type { EditorCategoryBase } from "@/components/dashboard/editor/types";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/ui-motion";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import { displayCategoryName, editorInputValue } from "@/lib/editor-locale";

interface CategoryEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: EditorCategoryBase | null;
  itemCount: number;
  itemLabel: string;
  onUpdateName: (name: string) => void;
  onUpdateNameEn: (nameEn: string) => void;
  onUpdateVisible: (visible: boolean) => void;
  onUpdateBackgroundColor: (value: string | null) => void;
  onUpdateTextColor: (value: string | null) => void;
  onUpdateFooterImage: (value: string | null) => void;
  extraSettings?: React.ReactNode;
  onDelete: () => void;
  children: React.ReactNode;
}

export function CategoryEditorDrawer({
  open,
  onOpenChange,
  category,
  itemCount,
  itemLabel,
  onUpdateName,
  onUpdateNameEn,
  onUpdateVisible,
  onUpdateBackgroundColor,
  onUpdateTextColor,
  onUpdateFooterImage,
  extraSettings,
  onDelete,
  children,
}: CategoryEditorDrawerProps) {
  const { locale } = useMenuEditorLanguage();
  const lastCategoryRef = useRef<EditorCategoryBase | null>(null);
  if (category) {
    lastCategoryRef.current = category;
  }

  const displayCategory = category ?? lastCategoryRef.current;
  if (!displayCategory) return null;

  const isEnglish = locale === "en";
  const categoryDisplayName = displayCategoryName(displayCategory, locale);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-3xl sm:max-w-4xl">
        <SheetHeader>
          <SheetTitle className="truncate pr-8">
            {categoryDisplayName}
          </SheetTitle>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            <span>
              {itemCount} {itemLabel}
            </span>
            {!displayCategory.visible && (
              <Badge variant="warning">Nascosta</Badge>
            )}
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="flex flex-col gap-0 p-0">
          <section className="space-y-3 border-b px-6 py-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="space-y-2">
                <Input
                  id="drawer-cat-name"
                  value={editorInputValue(
                    displayCategory.name,
                    displayCategory.nameEn,
                    locale
                  )}
                  onChange={(e) =>
                    isEnglish
                      ? onUpdateNameEn(e.target.value)
                      : onUpdateName(e.target.value)
                  }
                  placeholder={isEnglish ? "Category name" : "Nome categoria"}
                  className="h-9"
                  aria-label={
                    isEnglish ? "Nome categoria in inglese" : "Nome categoria"
                  }
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    pressable,
                    "h-9 shrink-0 text-destructive hover:text-destructive"
                  )}
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Elimina categoria
                </Button>
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="drawer-cat-visible"
                    className="shrink-0 text-sm text-muted-foreground"
                  >
                    Visibile
                  </Label>
                  <Switch
                    id="drawer-cat-visible"
                    checked={displayCategory.visible}
                    onCheckedChange={onUpdateVisible}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <CategoryColorPicker
                backgroundColor={displayCategory.backgroundColor}
                textColor={displayCategory.textColor}
                onBackgroundChange={onUpdateBackgroundColor}
                onTextColorChange={onUpdateTextColor}
              />
              {extraSettings}
              <CategoryImageUploader
                categoryId={displayCategory.id}
                imageUrl={displayCategory.footerImageUrl}
                onChange={onUpdateFooterImage}
              />
            </div>
          </section>

          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
