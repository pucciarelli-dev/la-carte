import { cn } from "@/lib/utils";

interface FontSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  fonts: Array<{ family: string; category: string }>;
  previewClassName?: string;
}

export function FontSelect({
  id,
  label,
  value,
  onChange,
  fonts,
  previewClassName,
}: FontSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
        style={{ fontFamily: `"${value}", sans-serif` }}
      >
        {fonts.map((font) => (
          <option
            key={font.family}
            value={font.family}
            style={{ fontFamily: `"${font.family}", ${font.category}` }}
          >
            {font.family}
          </option>
        ))}
      </select>
      <p
        className={cn(
          "text-sm text-muted-foreground",
          previewClassName
        )}
        style={{ fontFamily: `"${value}", sans-serif` }}
      >
        Anteprima — {value}
      </p>
    </div>
  );
}
