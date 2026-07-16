"use client";

import { useState } from "react";
import type { MenuAllergenEntry } from "@/lib/allergens";
import { describeAllergenNumbers, getEnabledAllergens } from "@/lib/allergens";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { pressable, scaleIn } from "@/lib/ui-motion";

interface AllergenPickerProps {
  legend: MenuAllergenEntry[];
  selected: string[];
  onToggle: (num: string) => void;
}

export function AllergenPicker({
  legend,
  selected,
  onToggle,
}: AllergenPickerProps) {
  const [showLegend, setShowLegend] = useState(false);
  const enabled = getEnabledAllergens(legend);
  const normalizedSelected = selected.filter((id) =>
    enabled.some((entry) => String(entry.num) === id)
  );

  return (
    <div className="space-y-3 lg:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Allergeni</Label>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => setShowLegend((open) => !open)}
        >
          {showLegend ? "Nascondi legenda" : "Mostra legenda"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {enabled.map((entry) => {
          const id = String(entry.num);
          const isSelected = normalizedSelected.includes(id);
          return (
            <button
              key={entry.num}
              type="button"
              title={`${entry.it} — ${entry.en}`}
              onClick={() => onToggle(id)}
              className={cn(
                pressable,
                "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:border-neutral-400"
              )}
            >
              {entry.num}
            </button>
          );
        })}
      </div>

      {normalizedSelected.length > 0 ? (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Selezionati: </span>
          {describeAllergenNumbers(normalizedSelected, legend)}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Nessun allergene selezionato. Clicca i numeri per associarli al piatto.
        </p>
      )}

      {showLegend && (
        <div className={cn(scaleIn, "max-h-48 overflow-y-auto rounded-lg border bg-muted/20 p-3 text-xs leading-relaxed")}>
          <p className="mb-2 font-medium">Legenda allergeni</p>
          <ul className="space-y-1.5">
            {enabled.map((entry) => (
              <li key={entry.num}>
                <span className="font-medium">{entry.num}</span> {entry.it} —{" "}
                {entry.en}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
