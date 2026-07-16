import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
        {
          default: "border-transparent bg-primary text-primary-foreground",
          secondary:
            "border-transparent bg-secondary text-secondary-foreground",
          outline: "text-foreground",
          success:
            "border-transparent bg-emerald-100 text-emerald-800",
          warning:
            "border-transparent bg-amber-100 text-amber-800",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
