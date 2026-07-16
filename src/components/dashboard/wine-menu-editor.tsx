"use client";

import { useState, useCallback, useMemo } from "react";
import { AddCategorySheet } from "@/components/dashboard/editor/add-category-sheet";
import { CategoryListScreen } from "@/components/dashboard/editor/category-list-screen";
import { CategoryEditorDrawer } from "@/components/dashboard/editor/category-editor-drawer";
import { HiddenItemsNotice } from "@/components/dashboard/editor/hidden-items-notice";
import {
  WineItemsPanel,
  type WineItemData,
} from "@/components/dashboard/editor/wine-items-panel";
import {
  createWineItem,
  updateWineItem,
  deleteWineItem,
  duplicateWineItem,
  reorderWineItems,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/server/actions/menu-actions";
import { useSaveToast } from "@/components/dashboard/save-toast";
import { useCategoryDrawer } from "@/hooks/use-category-drawer";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import {
  buildNewWineItemDefaults,
  displayCategoryName,
} from "@/lib/editor-locale";
import { mergeWineItemIntoOrderedList, sortWineItemsByPriceAsc } from "@/lib/wine-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CategoryData {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  visible: boolean;
  wineSortByPrice?: boolean;
  backgroundColor?: string | null;
  textColor?: string | null;
  footerImageUrl?: string | null;
  wineItems: WineItemData[];
}

interface WineMenuEditorProps {
  menuId: string;
  categories: CategoryData[];
}

export function WineMenuEditor({
  menuId,
  categories: initial,
}: WineMenuEditorProps) {
  const { locale } = useMenuEditorLanguage();
  const [categories, setCategories] = useState(initial);
  const {
    activeCategoryId,
    open: categoryDrawerOpen,
    openDrawer: openCategoryDrawer,
    onOpenChange: onCategoryDrawerOpenChange,
    closeImmediately: closeCategoryDrawer,
  } = useCategoryDrawer();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const { notifySaved } = useSaveToast();

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;
  const sortByPrice = Boolean(activeCategory?.wineSortByPrice);
  const activeItems = activeCategory
    ? sortByPrice
      ? sortWineItemsByPriceAsc(activeCategory.wineItems)
      : activeCategory.wineItems
    : [];
  const hiddenItemCount = useMemo(
    () =>
      categories.reduce(
        (sum, category) =>
          sum + category.wineItems.filter((item) => !item.visible).length,
        0
      ),
    [categories]
  );

  const handleReorderCategories = useCallback(
    async (reordered: CategoryData[]) => {
      const updated = reordered.map((cat, index) => ({ ...cat, order: index }));
      setCategories(updated);
      await reorderCategories(menuId, {
        items: updated.map((c) => ({ id: c.id, order: c.order })),
      });
      notifySaved("Ordine aggiornato");
    },
    [menuId, notifySaved]
  );

  const handleReorderItems = useCallback(
    async (categoryId: string, reordered: WineItemData[]) => {
      const updated = reordered.map((item, index) => ({ ...item, order: index }));
      setCategories((cats) =>
        cats.map((c) =>
          c.id === categoryId ? { ...c, wineItems: updated } : c
        )
      );
      await reorderWineItems(categoryId, {
        items: updated.map((i) => ({ id: i.id, order: i.order })),
      });
      notifySaved("Ordine aggiornato");
    },
    [notifySaved]
  );

  const handleCreateCategory = async (data: {
    name: string;
    nameEn: string;
    backgroundColor?: string | null;
    textColor?: string | null;
  }) => {
    const cat = await createCategory(menuId, data);
    setCategories((prev) => [...prev, { ...cat, wineItems: [] }]);
    openCategoryDrawer(cat.id);
  };

  const formatWineItem = (item: Awaited<ReturnType<typeof createWineItem>>) => ({
    ...item,
    glassPrice: item.glassPrice?.toString() ?? null,
    bottlePrice: item.bottlePrice?.toString() ?? null,
  });

  const handleAddItem = async (categoryId: string): Promise<string> => {
    const item = await createWineItem(categoryId, buildNewWineItemDefaults(locale));
    const formatted = formatWineItem(item);
    setCategories((cats) =>
      cats.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              wineItems: mergeWineItemIntoOrderedList(c.wineItems, formatted),
            }
          : c
      )
    );
    notifySaved("Vino aggiunto");
    return item.id;
  };

  const updateLocalItem = (
    categoryId: string,
    itemId: string,
    field: keyof WineItemData,
    value: string | boolean | null
  ) => {
    setCategories((cats) =>
      cats.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              wineItems: c.wineItems.map((i) =>
                i.id === itemId ? { ...i, [field]: value } : i
              ),
            }
          : c
      )
    );
  };

  const saveItem = async (item: WineItemData) => {
    const updated = await updateWineItem(item.id, {
      name: item.name,
      nameEn: item.nameEn ?? "",
      subcategory: item.subcategory,
      subcategoryEn: item.subcategoryEn ?? "",
      producer: item.producer,
      vintage: item.vintage,
      description: item.description,
      descriptionEn: item.descriptionEn ?? "",
      glassPrice: item.glassPrice ? parseFloat(item.glassPrice) : null,
      bottlePrice: item.bottlePrice ? parseFloat(item.bottlePrice) : null,
      visible: item.visible,
    });
    const formatted: WineItemData = {
      ...item,
      ...formatWineItem(updated),
    };
    setCategories((cats) =>
      cats.map((c) =>
        c.wineItems.some((row) => row.id === item.id)
          ? {
              ...c,
              wineItems: mergeWineItemIntoOrderedList(c.wineItems, formatted),
            }
          : c
      )
    );
    notifySaved();
  };

  return (
    <div className="space-y-6">
      <HiddenItemsNotice
        count={hiddenItemCount}
        itemLabelSingular="vino"
        itemLabelPlural="vini"
      />

      <CategoryListScreen
        categories={categories}
        itemLabelSingular="vino"
        itemLabelPlural="vini"
        getItemCount={(c) => c.wineItems.length}
        getHiddenItemCount={(c) =>
          c.wineItems.filter((item) => !item.visible).length
        }
        onReorder={handleReorderCategories}
        onOpenCategory={openCategoryDrawer}
        onAddCategory={() => setAddCategoryOpen(true)}
      />

      <AddCategorySheet
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        onCreate={handleCreateCategory}
      />

      <CategoryEditorDrawer
        open={categoryDrawerOpen}
        onOpenChange={onCategoryDrawerOpenChange}
        category={activeCategory}
        itemCount={activeCategory?.wineItems.length ?? 0}
        itemLabel={
          (activeCategory?.wineItems.length ?? 0) === 1 ? "vino" : "vini"
        }
        onUpdateName={(name) => {
          if (!activeCategory) return;
          void updateCategory(activeCategory.id, { name }).then(() => {
            setCategories((cats) =>
              cats.map((c) =>
                c.id === activeCategory.id ? { ...c, name } : c
              )
            );
            notifySaved();
          });
        }}
        onUpdateNameEn={(nameEn) => {
          if (!activeCategory) return;
          void updateCategory(activeCategory.id, { nameEn }).then(() => {
            setCategories((cats) =>
              cats.map((c) =>
                c.id === activeCategory.id ? { ...c, nameEn } : c
              )
            );
            notifySaved();
          });
        }}
        onUpdateVisible={(visible) => {
          if (!activeCategory) return;
          void updateCategory(activeCategory.id, { visible }).then(() => {
            setCategories((cats) =>
              cats.map((c) =>
                c.id === activeCategory.id ? { ...c, visible } : c
              )
            );
            notifySaved();
          });
        }}
        onUpdateBackgroundColor={(value) => {
          if (!activeCategory) return;
          void updateCategory(activeCategory.id, { backgroundColor: value }).then(
            () => {
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? { ...c, backgroundColor: value }
                    : c
                )
              );
              notifySaved();
            }
          );
        }}
        onUpdateTextColor={(value) => {
          if (!activeCategory) return;
          void updateCategory(activeCategory.id, { textColor: value }).then(() => {
            setCategories((cats) =>
              cats.map((c) =>
                c.id === activeCategory.id ? { ...c, textColor: value } : c
              )
            );
            notifySaved();
          });
        }}
        onUpdateFooterImage={(value) => {
          if (!activeCategory) return;
          void updateCategory(activeCategory.id, { footerImageUrl: value }).then(
            () => {
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? { ...c, footerImageUrl: value }
                    : c
                )
              );
              notifySaved();
            }
          );
        }}
        onDelete={() => {
          if (!activeCategory) return;
          void deleteCategory(activeCategory.id);
          setCategories((cats) =>
            cats.filter((c) => c.id !== activeCategory.id)
          );
          closeCategoryDrawer();
        }}
        extraSettings={
          activeCategory ? (
            <div className="flex items-center gap-2">
              <Label
                htmlFor="wine-sort-by-price"
                className="text-xs font-normal text-muted-foreground"
              >
                Ordina dal prezzo più basso
              </Label>
              <Switch
                id="wine-sort-by-price"
                checked={sortByPrice}
                onCheckedChange={(checked) => {
                  void updateCategory(activeCategory.id, {
                    wineSortByPrice: checked,
                  }).then(() => {
                    setCategories((cats) =>
                      cats.map((c) =>
                        c.id === activeCategory.id
                          ? { ...c, wineSortByPrice: checked }
                          : c
                      )
                    );
                    notifySaved();
                  });
                }}
              />
            </div>
          ) : null
        }
      >
        {activeCategory && (
          <WineItemsPanel
            drawerOpen={categoryDrawerOpen}
            categoryName={
              activeCategory ? displayCategoryName(activeCategory, locale) : undefined
            }
            key={activeCategory.id}
            items={activeItems}
            disableReorder={sortByPrice}
            onReorder={(items) => handleReorderItems(activeCategory.id, items)}
            onAddItem={() => handleAddItem(activeCategory.id)}
            onUpdateItem={(itemId, field, value) =>
              updateLocalItem(activeCategory.id, itemId, field, value)
            }
            onSaveItem={saveItem}
            onToggleVisible={(itemId) => {
              const item = activeCategory.wineItems.find((i) => i.id === itemId);
              if (!item) return;
              const v = !item.visible;
              updateLocalItem(activeCategory.id, itemId, "visible", v);
              void updateWineItem(itemId, { visible: v }).then(() => notifySaved());
            }}
            onDuplicate={async (itemId) => {
              const dup = await duplicateWineItem(itemId);
              const formatted = formatWineItem(dup);
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? {
                        ...c,
                        wineItems: mergeWineItemIntoOrderedList(c.wineItems, formatted),
                      }
                    : c
                )
              );
            }}
            onDelete={async (itemId) => {
              await deleteWineItem(itemId);
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? {
                        ...c,
                        wineItems: c.wineItems.filter((i) => i.id !== itemId),
                      }
                    : c
                )
              );
            }}
          />
        )}
      </CategoryEditorDrawer>
    </div>
  );
}
