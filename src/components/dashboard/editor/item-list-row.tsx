"use client";

import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { itemRowHover } from "@/lib/ui-motion";

interface ItemListRowProps {
  name: string;
  subtitle?: string;
  price?: string | number | null;
  visible: boolean;
  isPlaceholder?: boolean;
  onClick: () => void;
}

export function ItemListRow({
  name,
  subtitle,
  price,
  visible,
  isPlaceholder = false,
  onClick,
}: ItemListRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        itemRowHover,
        "group flex w-full min-w-0 items-center gap-3 rounded-lg border bg-card px-4 py-3 text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !visible && "opacity-60"
      )}
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            isPlaceholder && "italic text-muted-foreground"
          )}
        >
          {name || "Senza nome"}
        </p>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {price != null && price !== "" && (
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatPrice(price)}
        </span>
      )}
      {visible ? (
        <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      ) : (
        <EyeOff className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
