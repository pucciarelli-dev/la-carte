"use client";

import { useState, useTransition } from "react";
import { FolderPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryColorPicker } from "@/components/dashboard/category-color-picker";
import { useMenuEditorLanguage } from "@/components/dashboard/menu-editor-language";
import { buildNewCategoryPayload, localizedLabel } from "@/lib/editor-locale";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/ui-motion";

interface AddCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    nameEn: string;
    backgroundColor?: string | null;
    textColor?: string | null;
  }) => Promise<void>;
}

export function AddCategorySheet({
  open,
  onOpenChange,
  onCreate,
}: AddCategorySheetProps) {
  const { locale } = useMenuEditorLanguage();
  const isEnglish = locale === "en";
  const [name, setName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setName("");
    setBackgroundColor(null);
    setTextColor(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await onCreate(
        buildNewCategoryPayload(name, locale, {
          backgroundColor,
          textColor,
        })
      );
      reset();
      onOpenChange(false);
    });
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent className="max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            Nuova categoria
          </SheetTitle>
          <SheetDescription>
            Crea una categoria e poi aggiungi i prodotti dal drawer dedicato.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                {localizedLabel("Nome categoria", locale)}
              </Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEnglish ? "e.g. Appetizers" : "Es. Antipasti"}
                autoFocus
              />
            </div>

            <CategoryColorPicker
              backgroundColor={backgroundColor}
              textColor={textColor}
              onBackgroundChange={setBackgroundColor}
              onTextColorChange={setTextColor}
            />

            <Button
              type="submit"
              className={cn(pressable, "w-full")}
              disabled={!name.trim() || isPending}
            >
              {isPending ? "Creazione..." : "Crea categoria"}
            </Button>
          </form>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
