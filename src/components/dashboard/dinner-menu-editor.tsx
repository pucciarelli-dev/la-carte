"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { AutosaveIndicator } from "@/components/dashboard/autosave-indicator";
import { AddCategorySheet } from "@/components/dashboard/editor/add-category-sheet";
import { CategoryListScreen } from "@/components/dashboard/editor/category-list-screen";
import { CategoryEditorDrawer } from "@/components/dashboard/editor/category-editor-drawer";
import { HiddenItemsNotice } from "@/components/dashboard/editor/hidden-items-notice";
import {
  DinnerItemsPanel,
  type DinnerItemData,
} from "@/components/dashboard/editor/dinner-items-panel";
import { useMenuAutosave } from "@/hooks/use-menu-autosave";
import { useCategoryDrawer } from "@/hooks/use-category-drawer";
import { useSaveToast } from "@/components/dashboard/save-toast";
import { useRegisterMenuEditorSave } from "@/components/dashboard/menu-editor-save";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import { buildNewMenuItemDefaults } from "@/lib/editor-locale";
import { AllergenManagerSheet } from "@/components/dashboard/editor/allergen-manager-sheet";
import {
  normalizeAllergenIds,
  type MenuAllergenEntry,
} from "@/lib/allergens";
import {
  createMenuItem,
  deleteMenuItem,
  duplicateMenuItem,
  reorderMenuItems,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  persistDinnerMenuAction,
} from "@/server/actions/menu-actions";

interface CategoryData {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  visible: boolean;
  backgroundColor?: string | null;
  textColor?: string | null;
  footerImageUrl?: string | null;
  menuItems: DinnerItemData[];
}

interface DinnerMenuEditorProps {
  menuId: string;
  allergenLegend: MenuAllergenEntry[];
  categories: CategoryData[];
}

function serializeCategories(categories: CategoryData[]): string {
  return JSON.stringify(
    categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn ?? "",
      visible: cat.visible,
      order: cat.order,
      backgroundColor: cat.backgroundColor ?? null,
      textColor: cat.textColor ?? null,
      menuItems: cat.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        nameEn: item.nameEn ?? "",
        description: item.description,
        descriptionEn: item.descriptionEn ?? "",
        price: parseFloat(String(item.price)) || 0,
        visible: item.visible,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isGlutenFree: item.isGlutenFree,
        isSpicy: item.isSpicy,
        allergens: item.allergens,
      })),
    }))
  );
}

export function DinnerMenuEditor({
  menuId,
  allergenLegend: initialLegend,
  categories: initial,
}: DinnerMenuEditorProps) {
  const { locale } = useMenuEditorLanguage();
  const [categories, setCategories] = useState(
    initial.map((cat) => ({
      ...cat,
      menuItems: cat.menuItems.map((item) => ({
        ...item,
        allergens: normalizeAllergenIds(item.allergens),
      })),
    }))
  );
  const [allergenLegend, setAllergenLegend] = useState(initialLegend);
  const {
    activeCategoryId,
    open: categoryDrawerOpen,
    openDrawer: openCategoryDrawer,
    onOpenChange: onCategoryDrawerOpenChange,
    closeImmediately: closeCategoryDrawer,
  } = useCategoryDrawer();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [saveTrigger, setSaveTrigger] = useState(0);
  const categoriesRef = useRef(categories);
  categoriesRef.current = categories;

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;
  const hiddenItemCount = useMemo(
    () =>
      categories.reduce(
        (sum, category) =>
          sum + category.menuItems.filter((item) => !item.visible).length,
        0
      ),
    [categories]
  );

  const serialize = useCallback(
    (data: CategoryData[]) => serializeCategories(data),
    []
  );
  const { hasChanges, markSaved } = useMenuAutosave(
    initial,
    () => categoriesRef.current,
    serialize
  );
  const { notifySaved } = useSaveToast();

  const saveAndNotify = useCallback(() => {
    markSaved();
    notifySaved();
  }, [markSaved, notifySaved]);

  const setCategoriesAndTrack = useCallback(
    (updater: CategoryData[] | ((prev: CategoryData[]) => CategoryData[])) => {
      setCategories((prev) =>
        typeof updater === "function" ? updater(prev) : updater
      );
    },
    []
  );

  const triggerSave = useCallback(() => {
    setSaveTrigger((n) => n + 1);
  }, []);

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
    async (categoryId: string, reordered: DinnerItemData[]) => {
      const updated = reordered.map((item, index) => ({ ...item, order: index }));
      setCategories((cats) =>
        cats.map((c) =>
          c.id === categoryId ? { ...c, menuItems: updated } : c
        )
      );
      await reorderMenuItems(categoryId, {
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
    const newCategory: CategoryData = { ...cat, menuItems: [] };
    setCategories((prev) => [...prev, newCategory]);
    openCategoryDrawer(cat.id);
  };

  const handleUpdateCategoryColor = (
    id: string,
    field: "backgroundColor" | "textColor",
    value: string | null
  ) => {
    setCategoriesAndTrack((cats) =>
      cats.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
    void updateCategory(id, { [field]: value }).then(() => saveAndNotify());
  };

  const handleUpdateCategoryFooterImage = (id: string, value: string | null) => {
    setCategoriesAndTrack((cats) =>
      cats.map((c) => (c.id === id ? { ...c, footerImageUrl: value } : c))
    );
    void updateCategory(id, { footerImageUrl: value }).then(() => saveAndNotify());
  };

  const handleUpdateCategory = (
    id: string,
    field: "name" | "nameEn",
    value: string
  ) => {
    setCategoriesAndTrack((cats) =>
      cats.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
    triggerSave();
  };

  const handleAddItem = async (categoryId: string): Promise<string> => {
    const item = await createMenuItem(categoryId, buildNewMenuItemDefaults(locale));
    setCategories((cats) =>
      cats.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              menuItems: [
                { ...item, price: item.price.toString() },
                ...c.menuItems,
              ],
            }
          : c
      )
    );
    notifySaved("Piatto aggiunto");
    return item.id;
  };

  const handleUpdateItem = (
    categoryId: string,
    itemId: string,
    field: keyof DinnerItemData,
    value: string | boolean | number | string[]
  ) => {
    setCategories((cats) =>
      cats.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              menuItems: c.menuItems.map((i) =>
                i.id === itemId ? { ...i, [field]: value } : i
              ),
            }
          : c
      )
    );
    triggerSave();
  };

  const persistChanges = useCallback(async (): Promise<boolean> => {
    const current = categoriesRef.current;
    if (!hasChanges()) return false;

    await persistDinnerMenuAction(
      menuId,
      current.map((cat) => ({
        id: cat.id,
        name: cat.name,
        nameEn: cat.nameEn ?? "",
        visible: cat.visible,
        backgroundColor: cat.backgroundColor ?? null,
        textColor: cat.textColor ?? null,
        footerImageUrl: cat.footerImageUrl ?? null,
        items: cat.menuItems.map((item) => ({
          id: item.id,
          name: item.name,
          nameEn: item.nameEn ?? "",
          description: item.description,
          descriptionEn: item.descriptionEn ?? "",
          price: parseFloat(String(item.price)) || 0,
          visible: item.visible,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          isGlutenFree: item.isGlutenFree,
          isSpicy: item.isSpicy,
          allergens: item.allergens,
        })),
      }))
    );

    markSaved();
    return true;
  }, [hasChanges, markSaved, menuId]);

  useRegisterMenuEditorSave(async () => {
    await persistChanges();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AutosaveIndicator
          trigger={saveTrigger}
          hasChanges={hasChanges}
          onSave={persistChanges}
        />
        <AllergenManagerSheet
          menuId={menuId}
          legend={allergenLegend}
          onLegendChange={setAllergenLegend}
        />
      </div>

      <HiddenItemsNotice
        count={hiddenItemCount}
        itemLabelSingular="piatto"
        itemLabelPlural="piatti"
      />

      <CategoryListScreen
        categories={categories}
        itemLabelSingular="piatto"
        itemLabelPlural="piatti"
        getItemCount={(c) => c.menuItems.length}
        getHiddenItemCount={(c) =>
          c.menuItems.filter((item) => !item.visible).length
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
        itemCount={activeCategory?.menuItems.length ?? 0}
        itemLabel={
          (activeCategory?.menuItems.length ?? 0) === 1 ? "piatto" : "piatti"
        }
        onUpdateName={(name) =>
          activeCategory && handleUpdateCategory(activeCategory.id, "name", name)
        }
        onUpdateNameEn={(nameEn) =>
          activeCategory &&
          handleUpdateCategory(activeCategory.id, "nameEn", nameEn)
        }
        onUpdateVisible={(visible) => {
          if (!activeCategory) return;
          setCategoriesAndTrack((cats) =>
            cats.map((c) =>
              c.id === activeCategory.id ? { ...c, visible } : c
            )
          );
          void updateCategory(activeCategory.id, { visible }).then(() =>
            saveAndNotify()
          );
        }}
        onUpdateBackgroundColor={(value) =>
          activeCategory &&
          handleUpdateCategoryColor(activeCategory.id, "backgroundColor", value)
        }
        onUpdateTextColor={(value) =>
          activeCategory &&
          handleUpdateCategoryColor(activeCategory.id, "textColor", value)
        }
        onUpdateFooterImage={(value) =>
          activeCategory &&
          handleUpdateCategoryFooterImage(activeCategory.id, value)
        }
        onDelete={() => {
          if (!activeCategory) return;
          void deleteCategory(activeCategory.id);
          setCategories((cats) => cats.filter((c) => c.id !== activeCategory.id));
          closeCategoryDrawer();
        }}
      >
        {activeCategory && (
          <DinnerItemsPanel
            drawerOpen={categoryDrawerOpen}
            key={activeCategory.id}
            allergenLegend={allergenLegend}
            items={activeCategory.menuItems}
            onReorder={(items) => handleReorderItems(activeCategory.id, items)}
            onAddItem={() => handleAddItem(activeCategory.id)}
            onUpdateItem={(itemId, field, value) =>
              handleUpdateItem(activeCategory.id, itemId, field, value)
            }
            onToggleAllergen={(itemId, num) => {
              const item = activeCategory.menuItems.find((i) => i.id === itemId);
              if (!item) return;
              const next = item.allergens.includes(num)
                ? item.allergens.filter((id) => id !== num)
                : [...item.allergens, num].sort(
                    (a, b) => parseInt(a, 10) - parseInt(b, 10)
                  );
              handleUpdateItem(activeCategory.id, itemId, "allergens", next);
            }}
            onToggleFlag={(itemId, field) => {
              const item = activeCategory.menuItems.find((i) => i.id === itemId);
              if (!item) return;
              handleUpdateItem(activeCategory.id, itemId, field, !item[field]);
            }}
            onToggleVisible={(itemId) => {
              const item = activeCategory.menuItems.find((i) => i.id === itemId);
              if (!item) return;
              handleUpdateItem(activeCategory.id, itemId, "visible", !item.visible);
            }}
            onDuplicate={async (itemId) => {
              const dup = await duplicateMenuItem(itemId);
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? {
                        ...c,
                        menuItems: [
                          ...c.menuItems,
                          { ...dup, price: dup.price.toString() },
                        ],
                      }
                    : c
                )
              );
            }}
            onDelete={async (itemId) => {
              await deleteMenuItem(itemId);
              setCategories((cats) =>
                cats.map((c) =>
                  c.id === activeCategory.id
                    ? {
                        ...c,
                        menuItems: c.menuItems.filter((i) => i.id !== itemId),
                      }
                    : c
                )
              );
            }}
            onFieldBlur={() => void persistChanges()}
          />
        )}
      </CategoryEditorDrawer>
    </div>
  );
}
