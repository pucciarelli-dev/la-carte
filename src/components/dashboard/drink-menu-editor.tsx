"use client";

import { useState, useCallback, useMemo } from "react";
import { AddCategorySheet } from "@/components/dashboard/editor/add-category-sheet";
import { CategoryListScreen } from "@/components/dashboard/editor/category-list-screen";
import { CategoryEditorDrawer } from "@/components/dashboard/editor/category-editor-drawer";
import { HiddenItemsNotice } from "@/components/dashboard/editor/hidden-items-notice";
import {
  DrinkItemsPanel,
  type DrinkItemData,
} from "@/components/dashboard/editor/drink-items-panel";
import {
  createDrinkItem,
  updateDrinkItem,
  deleteDrinkItem,
  duplicateDrinkItem,
  reorderDrinkItems,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/server/actions/menu-actions";
import { useSaveToast } from "@/components/dashboard/save-toast";
import { useCategoryDrawer } from "@/hooks/use-category-drawer";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import { buildNewDrinkItemDefaults } from "@/lib/editor-locale";

interface CategoryData {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  visible: boolean;
  backgroundColor?: string | null;
  textColor?: string | null;
  footerImageUrl?: string | null;
  drinkItems: DrinkItemData[];
}

interface DrinkMenuEditorProps {
  menuId: string;
  categories: CategoryData[];
}

export function DrinkMenuEditor({
  menuId,
  categories: initial,
}: DrinkMenuEditorProps) {
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
  const hiddenItemCount = useMemo(
    () =>
      categories.reduce(
        (sum, category) =>
          sum + category.drinkItems.filter((item) => !item.visible).length,
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
    async (categoryId: string, reordered: DrinkItemData[]) => {
      const updated = reordered.map((item, index) => ({ ...item, order: index }));
      setCategories((cats) =>
        cats.map((c) =>
          c.id === categoryId ? { ...c, drinkItems: updated } : c
        )
      );
      await reorderDrinkItems(categoryId, {
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
    setCategories((prev) => [...prev, { ...cat, drinkItems: [] }]);
    openCategoryDrawer(cat.id);
  };

  const handleAddItem = async (categoryId: string): Promise<string> => {
    const item = await createDrinkItem(
      categoryId,
      buildNewDrinkItemDefaults(locale)
    );
    setCategories((cats) =>
      cats.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              drinkItems: [
                { ...item, price: item.price.toString() },
                ...c.drinkItems,
              ],
            }
          : c
      )
    );
    notifySaved("Drink aggiunto");
    return item.id;
  };

  const updateLocalItem = (
    categoryId: string,
    itemId: string,
    field: keyof DrinkItemData,
    value: string | boolean
  ) => {
    setCategories((cats) =>
      cats.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              drinkItems: c.drinkItems.map((i) =>
                i.id === itemId ? { ...i, [field]: value } : i
              ),
            }
          : c
      )
    );
  };

  const saveItem = async (item: DrinkItemData) => {
    await updateDrinkItem(item.id, {
      name: item.name,
      nameEn: item.nameEn ?? "",
      ingredients: item.ingredients,
      ingredientsEn: item.ingredientsEn ?? "",
      description: item.description,
      descriptionEn: item.descriptionEn ?? "",
      price: parseFloat(item.price) || 0,
      visible: item.visible,
    });
    notifySaved();
  };

  return (
    <div className="space-y-6">
      <HiddenItemsNotice
        count={hiddenItemCount}
        itemLabelSingular="drink"
        itemLabelPlural="drink"
      />

      <CategoryListScreen
        categories={categories}
        itemLabelSingular="drink"
        itemLabelPlural="drink"
        getItemCount={(c) => c.drinkItems.length}
        getHiddenItemCount={(c) =>
          c.drinkItems.filter((item) => !item.visible).length
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
        itemCount={activeCategory?.drinkItems.length ?? 0}
        itemLabel="drink"
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
      >
        {activeCategory && (
          <DrinkItemsPanel
            drawerOpen={categoryDrawerOpen}
            key={activeCategory.id}
            items={activeCategory.drinkItems}
            onReorder={(items) => handleReorderItems(activeCategory.id, items)}
            onAddItem={() => handleAddItem(activeCategory.id)}
            onUpdateItem={(itemId, field, value) =>
              updateLocalItem(activeCategory.id, itemId, field, value)
            }
            onSaveItem={saveItem}
            onToggleVisible={(itemId) => {
              const item = activeCategory.drinkItems.find((i) => i.id === itemId);
              if (!item) return;
              const v = !item.visible;
              updateLocalItem(activeCategory.id, itemId, "visible", v);
              void updateDrinkItem(itemId, { visible: v }).then(() => notifySaved());
            }}
            onDuplicate={async (itemId) => {
              const dup = await duplicateDrinkItem(itemId);
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? {
                        ...c,
                        drinkItems: [
                          ...c.drinkItems,
                          { ...dup, price: dup.price.toString() },
                        ],
                      }
                    : c
                )
              );
            }}
            onDelete={async (itemId) => {
              await deleteDrinkItem(itemId);
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? {
                        ...c,
                        drinkItems: c.drinkItems.filter((i) => i.id !== itemId),
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
