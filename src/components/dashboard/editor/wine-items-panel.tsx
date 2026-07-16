"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Search,
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
  displayItemName,
  displayWineItemSubtitle,
  editorInputValue,
} from "@/lib/editor-locale";
import { useRegisterMenuEditorSave } from "@/components/dashboard/menu-editor-save";
import { filterWineItems } from "@/lib/wine-menu-search";
import { WINE_LIST_PAGE_SIZE } from "@/lib/wine-menu";

export interface WineItemData {
  id: string;
  name: string;
  nameEn?: string;
  subcategory: string;
  subcategoryEn?: string;
  producer: string;
  vintage: string | null;
  description: string;
  descriptionEn?: string;
  glassPrice: string | null;
  bottlePrice: string | null;
  order: number;
  visible: boolean;
}

interface WineItemsPanelProps {
  drawerOpen?: boolean;
  categoryName?: string;
  items: WineItemData[];
  onReorder: (items: WineItemData[]) => void;
  disableReorder?: boolean;
  onAddItem: () => Promise<string | void> | string | void;
  onUpdateItem: (
    itemId: string,
    field: keyof WineItemData,
    value: string | boolean | null
  ) => void;
  onSaveItem: (item: WineItemData) => void;
  onToggleVisible: (itemId: string) => void;
  onDuplicate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export function WineItemsPanel({
  drawerOpen = true,
  categoryName,
  items,
  onReorder,
  disableReorder = false,
  onAddItem,
  onUpdateItem,
  onSaveItem,
  onToggleVisible,
  onDuplicate,
  onDelete,
}: WineItemsPanelProps) {
  const { locale } = useMenuEditorLanguage();
  const isEnglish = locale === "en";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const editingItem = items.find((i) => i.id === editingId);
  const filteredItems = useMemo(
    () => filterWineItems(items, searchQuery),
    [items, searchQuery]
  );
  const isSearching = searchQuery.trim().length > 0;
  const showSearch = items.length > WINE_LIST_PAGE_SIZE;
  const listItems = isSearching ? filteredItems : items;

  useEffect(() => {
    if (!drawerOpen) {
      setEditingId(null);
      setSearchQuery("");
    }
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
              Torna ai vini
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Produttore
                  </label>
                  <Input
                    value={editingItem.producer}
                    onChange={(e) =>
                      onUpdateItem(editingItem.id, "producer", e.target.value)
                    }
                    onBlur={blurSave}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Annata
                  </label>
                  <Input
                    value={editingItem.vintage ?? ""}
                    onChange={(e) =>
                      onUpdateItem(
                        editingItem.id,
                        "vintage",
                        e.target.value || null
                      )
                    }
                    onBlur={blurSave}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Regione{isEnglish ? " (EN)" : ""}
                </label>
                <Input
                  value={editorInputValue(
                    editingItem.subcategory,
                    editingItem.subcategoryEn,
                    locale
                  )}
                  onChange={(e) =>
                    onUpdateItem(
                      editingItem.id,
                      isEnglish ? "subcategoryEn" : "subcategory",
                      e.target.value
                    )
                  }
                  onBlur={blurSave}
                  placeholder="Es. Toscana, Piemonte..."
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Prezzo calice
                  </label>
                  <Input
                    value={editingItem.glassPrice ?? ""}
                    onChange={(e) =>
                      onUpdateItem(
                        editingItem.id,
                        "glassPrice",
                        e.target.value || null
                      )
                    }
                    onBlur={blurSave}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Prezzo bottiglia
                  </label>
                  <Input
                    value={editingItem.bottlePrice ?? ""}
                    onChange={(e) =>
                      onUpdateItem(
                        editingItem.id,
                        "bottlePrice",
                        e.target.value || null
                      )
                    }
                    onBlur={blurSave}
                  />
                </div>
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
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-medium">Vini</h4>
        <Button size="sm" className={pressable} onClick={() => void openNewItem()}>
          <Plus className="h-4 w-4" />
          Aggiungi
        </Button>
      </div>

      {showSearch && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                categoryName
                  ? `Cerca in ${categoryName}...`
                  : "Cerca per nome, produttore, regione..."
              }
              className="pl-9"
            />
          </div>
          {isSearching && (
            <p className="text-xs text-muted-foreground">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "risultato" : "risultati"}
            </p>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center">
          <p className="text-sm text-muted-foreground">Nessun vino</p>
          <Button
            variant="outline"
            size="sm"
            className={cn(pressable, "mt-3")}
            onClick={() => void openNewItem()}
          >
            <Plus className="h-4 w-4" />
            Aggiungi il primo vino
          </Button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nessun vino corrisponde alla ricerca
          </p>
        </div>
      ) : isSearching ? (
        <div className="space-y-2">
          {listItems.map((item) => (
            <ItemListRow
              key={item.id}
              name={displayItemName(item, locale)}
              subtitle={displayWineItemSubtitle(item, locale)}
              price={item.bottlePrice ?? item.glassPrice}
              visible={item.visible}
              onClick={() => setEditingId(item.id)}
            />
          ))}
        </div>
      ) : disableReorder ? (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemListRow
              key={item.id}
              name={displayItemName(item, locale)}
              subtitle={displayWineItemSubtitle(item, locale)}
              price={item.bottlePrice ?? item.glassPrice}
              visible={item.visible}
              onClick={() => setEditingId(item.id)}
            />
          ))}
        </div>
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          className="space-y-2"
          renderItem={(item) => (
            <ItemListRow
              name={displayItemName(item, locale)}
              subtitle={displayWineItemSubtitle(item, locale)}
              price={item.bottlePrice ?? item.glassPrice}
              visible={item.visible}
              onClick={() => setEditingId(item.id)}
            />
          )}
        />
      )}
    </div>
  );
}
