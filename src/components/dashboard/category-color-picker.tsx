"use client";

import { cn } from "@/lib/utils";

interface CategoryColorPickerProps {
  backgroundColor?: string | null;
  textColor?: string | null;
  onBackgroundChange: (value: string | null) => void;
  onTextColorChange: (value: string | null) => void;
}

function ColorSwatch({
  id,
  label,
  value,
  fallback,
  variant,
  onChange,
}: {
  id: string;
  label: string;
  value: string | null | undefined;
  fallback: string;
  variant: "background" | "text";
  onChange: (value: string) => void;
}) {
  const color = value ?? fallback;

  return (
    <div className="flex items-center gap-1.5">
      <label
        htmlFor={id}
        className={cn(
          "relative flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border bg-background",
          value ? "border-foreground/20" : "border-dashed border-muted-foreground/40"
        )}
        style={variant === "background" ? { backgroundColor: color } : undefined}
      >
        {variant === "text" && (
          <span
            className="text-[10px] font-semibold leading-none"
            style={{ color }}
            aria-hidden
          >
            A
          </span>
        )}
        <input
          id={id}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function CategoryColorPicker({
  backgroundColor,
  textColor,
  onBackgroundChange,
  onTextColorChange,
}: CategoryColorPickerProps) {
  const hasCustomColors = Boolean(backgroundColor || textColor);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <ColorSwatch
        id="category-bg-color"
        label="Sfondo"
        value={backgroundColor}
        fallback="#ffffff"
        variant="background"
        onChange={onBackgroundChange}
      />
      <ColorSwatch
        id="category-text-color"
        label="Testo"
        value={textColor}
        fallback="#1c1c1c"
        variant="text"
        onChange={onTextColorChange}
      />
      {hasCustomColors && (
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => {
            onBackgroundChange(null);
            onTextColorChange(null);
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}
