"use client";

import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface HiddenItemsNoticeProps {
  count: number;
  itemLabelSingular: string;
  itemLabelPlural: string;
  className?: string;
}

export function HiddenItemsNotice({
  count,
  itemLabelSingular,
  itemLabelPlural,
  className,
}: HiddenItemsNoticeProps) {
  if (count <= 0) return null;

  const label = count === 1 ? itemLabelSingular : itemLabelPlural;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950",
        className
      )}
      role="status"
    >
      <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <p>
        <span className="font-medium">
          {count} {label} non {count === 1 ? "visibile" : "visibili"}
        </span>{" "}
        nel menu pubblico. Riattivali quando tornano disponibili.
      </p>
    </div>
  );
}
