"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SortableList } from "@/components/dashboard/sortable-list";
import { ItemListRow } from "@/components/dashboard/editor/item-list-row";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/ui-motion";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import {
  displayDrinkIngredients,
  displayItemDescription,
  displayItemName,
  editorInputValue,
} from "@/lib/editor-locale";
import { useRegisterMenuEditorSave } from "@/components/dashboard/menu-editor-save";

export interface DrinkItemData {
  id: string;
  name: string;
  nameEn?: string;
  ingredients: string;
  ingredientsEn?: string;
  description: string;
  descriptionEn?: string;
  price: string;
  order: number;
  visible: boolean;
}

interface DrinkItemsPanelProps {
  drawerOpen?: boolean;
  items: DrinkItemData[];
  onReorder: (items: DrinkItemData[]) => void;
  onAddItem: () => Promise<string | void> | string | void;
  onUpdateItem: (
    itemId: string,
    field: keyof DrinkItemData,
    value: string | boolean
  ) => void;
  onSaveItem: (item: DrinkItemData) => void;
  onToggleVisible: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function DrinkItemsPanel({
  drawerOpen = true,
  items,
  onReorder,
  onAddItem,
  onUpdateItem,
  onSaveItem,
  onToggleVisible,
  onDuplicate,
  onDelete,
}: DrinkItemsPanelProps) {
  const { locale } = useMenuEditorLanguage();
  const isEnglish = locale === "en";
  const [editingId, setEditingId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const editingItem = items.find((i) => i.id === editingId);

  useEffect(() => {
    if (!drawerOpen) setEditingId(null);
  }, [drawerOpen]);

  useEffect(() => {
    if (!editingId) return;
    const frame = requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [editingId]);

  const openNewItem = async () => {
    const newId = await onAddItem();
    if (typeof newId === "string") {
      setEditingId(newId);
    }
  };

  const blurSave = () => {
    if (editingItem) onSaveItem(editingItem);
  };

  useRegisterMenuEditorSave(async () => {
    if (editingItem) {
      await onSaveItem(editingItem);
    }
  });

  const handleClose = () => {
    blurSave();
    setEditingId(null);
  };

  if (editingItem) {
    return (
      <div className="space-y-5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(pressable, "-ml-2 gap-1 text-muted-foreground")}
          onClick={handleClose}
        >
              <ArrowLeft className="h-4 w-4" />
              Torna ai drink
            </Button>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Nome{isEnglish ? " (EN)" : ""}
                </label>
                <Input
                  ref={nameInputRef}
                  value={editorInputValue(
                    editingItem.name,
                    editingItem.nameEn,
                    locale
                  )}
                  onChange={(e) =>
                    onUpdateItem(
                      editingItem.id,
                      isEnglish ? "nameEn" : "name",
                      e.target.value
                    )
                  }
                  onBlur={blurSave}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Ingredienti{isEnglish ? " (EN)" : ""}
                </label>
                <Input
                  value={editorInputValue(
                    editingItem.ingredients,
                    editingItem.ingredientsEn,
                    locale
                  )}
                  onChange={(e) =>
                    onUpdateItem(
                      editingItem.id,
                      isEnglish ? "ingredientsEn" : "ingredients",
                      e.target.value
                    )
                  }
                  onBlur={blurSave}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Descrizione{isEnglish ? " (EN)" : ""}
                </label>
                <Textarea
                  value={editorInputValue(
                    editingItem.description,
                    editingItem.descriptionEn,
                    locale
                  )}
                  onChange={(e) =>
                    onUpdateItem(
                      editingItem.id,
                      isEnglish ? "descriptionEn" : "description",
                      e.target.value
                    )
                  }
                  onBlur={blurSave}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Prezzo
                </label>
                <Input
                  value={editingItem.price}
                  onChange={(e) =>
                    onUpdateItem(editingItem.id, "price", e.target.value)
                  }
                  onBlur={blurSave}
                  className="w-32"
                />
              </div>

              <div className="flex items-center gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className={pressable}
                  onClick={() => onToggleVisible(editingItem.id)}
                >
                  {editingItem.visible ? (
                    <>
                      <Eye className="h-4 w-4" />
                      Visibile
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Nascosto
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={pressable}
                  onClick={() => onDuplicate(editingItem.id)}
                >
                  <Copy className="h-4 w-4" />
                  Duplica
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    pressable,
                    "ml-auto text-destructive hover:text-destructive"
                  )}
                  onClick={() => {
                    onDelete(editingItem.id);
                    setEditingId(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Elimina
                </Button>
              </div>
            </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Drink</h4>
        <Button size="sm" className={pressable} onClick={() => void openNewItem()}>
          <Plus className="h-4 w-4" />
          Aggiungi
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center">
          <p className="text-sm text-muted-foreground">Nessun drink</p>
          <Button
            variant="outline"
            size="sm"
            className={cn(pressable, "mt-3")}
            onClick={() => void openNewItem()}
          >
            <Plus className="h-4 w-4" />
            Aggiungi il primo drink
          </Button>
        </div>
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          className="space-y-2"
          renderItem={(item) => (
            <ItemListRow
              name={displayItemName(item, locale)}
              subtitle={
                displayDrinkIngredients(item, locale) ||
                displayItemDescription(item, locale) ||
                undefined
              }
              price={item.price}
              visible={item.visible}
              onClick={() => setEditingId(item.id)}
            />
          )}
        />
      )}
    </div>
  );
}
