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
import { AllergenPicker } from "@/components/dashboard/editor/allergen-picker";
import { formatPrice, cn } from "@/lib/utils";
import type { MenuAllergenEntry } from "@/lib/allergens";
import { formatAllergenNumbers } from "@/lib/allergens";
import { pressable } from "@/lib/ui-motion";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import {
  displayItemDescription,
  displayItemName,
  editorInputValue,
} from "@/lib/editor-locale";

export interface DinnerItemData {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: string | number;
  order: number;
  visible: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  allergens: string[];
}

interface DinnerItemsPanelProps {
  drawerOpen?: boolean;
  allergenLegend: MenuAllergenEntry[];
  items: DinnerItemData[];
  onReorder: (items: DinnerItemData[]) => void;
  onAddItem: () => Promise<string | void> | string | void;
  onUpdateItem: (
    itemId: string,
    field: keyof DinnerItemData,
    value: string | boolean | number | string[]
  ) => void;
  onToggleAllergen: (itemId: string, num: string) => void;
  onToggleFlag: (
    itemId: string,
    field: "isVegetarian" | "isVegan" | "isGlutenFree" | "isSpicy"
  ) => void;
  onToggleVisible: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onFieldBlur?: () => void;
}

export function DinnerItemsPanel({
  drawerOpen = true,
  allergenLegend,
  items,
  onReorder,
  onAddItem,
  onUpdateItem,
  onToggleAllergen,
  onToggleFlag,
  onToggleVisible,
  onDuplicate,
  onDelete,
  onFieldBlur,
}: DinnerItemsPanelProps) {
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

  if (editingItem) {
    return (
      <div className="space-y-5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(pressable, "-ml-2 gap-1 text-muted-foreground")}
          onClick={() => setEditingId(null)}
        >
              <ArrowLeft className="h-4 w-4" />
              Torna ai piatti
            </Button>

            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Nome piatto{isEnglish ? " (EN)" : ""}
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
                    onBlur={onFieldBlur}
                    className="text-base font-medium"
                  />
                </div>

                <div className="space-y-2 lg:col-span-2">
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
                    onBlur={onFieldBlur}
                    rows={4}
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
                    onBlur={onFieldBlur}
                    className="w-full"
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Anteprima: {formatPrice(editingItem.price)}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Etichette
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["isVegetarian", "Vegetariano", "V"],
                        ["isVegan", "Vegano", "VG"],
                        ["isGlutenFree", "Senza glutine", "SG"],
                        ["isSpicy", "Piccante", "🌶"],
                      ] as const
                    ).map(([field, label, short]) => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => onToggleFlag(editingItem.id, field)}
                        className={cn(
                          pressable,
                          "rounded-full border px-3 py-1 text-xs transition-colors",
                          editingItem[field]
                            ? "border-primary bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:border-neutral-300"
                        )}
                      >
                        {short} · {label}
                      </button>
                    ))}
                  </div>
                </div>

                <AllergenPicker
                  legend={allergenLegend}
                  selected={editingItem.allergens}
                  onToggle={(num) => onToggleAllergen(editingItem.id, num)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
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
        <h4 className="text-sm font-medium">Piatti</h4>
        <Button
          size="sm"
          className={pressable}
          onClick={() => void openNewItem()}
        >
          <Plus className="h-4 w-4" />
          Aggiungi
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nessun piatto in questa categoria
          </p>
          <Button
            variant="outline"
            size="sm"
            className={cn(pressable, "mt-3")}
            onClick={() => void openNewItem()}
          >
            <Plus className="h-4 w-4" />
            Aggiungi il primo piatto
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
                [
                  displayItemDescription(item, locale),
                  item.allergens.length > 0
                    ? `Allergeni: ${formatAllergenNumbers(item.allergens)}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || undefined
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
