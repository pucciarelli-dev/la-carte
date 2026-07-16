"use client";

import { useState, useTransition } from "react";
import { ListTree } from "lucide-react";
import { pressable } from "@/lib/ui-motion";
import type { MenuAllergenEntry } from "@/lib/allergens";
import { updateMenuAllergenLegendAction } from "@/server/actions/settings-actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/dashboard/save-toast";
import { cn } from "@/lib/utils";

interface AllergenManagerSheetProps {
  menuId: string;
  legend: MenuAllergenEntry[];
  onLegendChange: (legend: MenuAllergenEntry[]) => void;
}

export function AllergenManagerSheet({
  menuId,
  legend,
  onLegendChange,
}: AllergenManagerSheetProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(legend);
  const [isPending, startTransition] = useTransition();
  const { notifySaved } = useSaveToast();

  const openSheet = () => {
    setDraft(legend);
    setOpen(true);
  };

  const toggleEnabled = (num: number, enabled: boolean) => {
    setDraft((current) =>
      current.map((entry) =>
        entry.num === num ? { ...entry, enabled } : entry
      )
    );
  };

  const handleSave = () => {
    startTransition(async () => {
      const saved = await updateMenuAllergenLegendAction(menuId, draft);
      onLegendChange(saved);
      notifySaved("Legenda allergeni salvata");
      setOpen(false);
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={pressable}
        onClick={openSheet}
      >
        <ListTree className="h-4 w-4" />
        Legenda allergeni
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-w-lg">
          <SheetHeader>
            <SheetTitle>Legenda allergeni del menu</SheetTitle>
            <SheetDescription>
              Elenco predefinito EU (1–14). Disattiva quelli non usati nel tuo
              locale.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <ul className="space-y-3">
              {draft.map((entry) => (
                <li
                  key={entry.num}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {entry.num}
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <p>{entry.it}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.en}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`allergen-${entry.num}`}
                      checked={entry.enabled}
                      onCheckedChange={(checked) =>
                        toggleEnabled(entry.num, checked)
                      }
                    />
                    <Label
                      htmlFor={`allergen-${entry.num}`}
                      className="sr-only"
                    >
                      Attivo
                    </Label>
                  </div>
                </li>
              ))}
            </ul>

            <Button
              className={cn(pressable, "w-full")}
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? "Salvataggio..." : "Salva legenda"}
            </Button>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}
