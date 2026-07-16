"use client";

import { useMemo } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableList } from "@/components/dashboard/sortable-list";
import { CategoryCard } from "@/components/dashboard/editor/category-card";
import type { EditorCategoryBase } from "@/components/dashboard/editor/types";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import {
  categoryVisibleInEditor,
  mergeReorderedCategories,
} from "@/lib/editor-locale";
import { cn } from "@/lib/utils";
import { pressable, scaleIn, staggerChildren } from "@/lib/ui-motion";

interface CategoryListScreenProps<T extends EditorCategoryBase> {
  categories: T[];
  itemLabelSingular: string;
  itemLabelPlural: string;
  getItemCount: (category: T) => number;
  getHiddenItemCount?: (category: T) => number;
  onReorder: (categories: T[]) => void;
  onOpenCategory: (id: string) => void;
  onAddCategory: () => void;
  addLabel?: string;
}

export function CategoryListScreen<T extends EditorCategoryBase>({
  categories,
  itemLabelSingular,
  itemLabelPlural,
  getItemCount,
  getHiddenItemCount,
  onReorder,
  onOpenCategory,
  onAddCategory,
  addLabel = "Nuova categoria",
}: CategoryListScreenProps<T>) {
  const { locale } = useMenuEditorLanguage();
  const visibleCategories = useMemo(
    () => categories.filter((category) => categoryVisibleInEditor(category, locale)),
    [categories, locale]
  );

  const handleReorder = (reordered: T[]) => {
    onReorder(mergeReorderedCategories(categories, reordered));
  };

  if (visibleCategories.length === 0) {
    return (
      <div
        className={cn(
          scaleIn,
          "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center"
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <FolderOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Nessuna categoria</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Inizia creando la prima categoria. I prodotti si gestiscono nel drawer
          dedicato.
        </p>
        <Button className={cn(pressable, "mt-6")} onClick={onAddCategory}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {visibleCategories.length}{" "}
          {visibleCategories.length === 1 ? "categoria" : "categorie"}
        </p>
        <Button
          size="sm"
          variant="outline"
          className={pressable}
          onClick={onAddCategory}
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      <SortableList
        items={visibleCategories}
        onReorder={handleReorder}
        className={cn(staggerChildren, "space-y-3")}
        renderItem={(category) => (
          <CategoryCard
            category={category}
            itemCount={getItemCount(category)}
            itemLabel={
              getItemCount(category) === 1 ? itemLabelSingular : itemLabelPlural
            }
            hiddenItemCount={getHiddenItemCount?.(category) ?? 0}
            onOpen={() => onOpenCategory(category.id)}
          />
        )}
      />
    </div>
  );
}
