import type { ReactNode } from "react";

export function EnglishFieldsSection({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-3 border-t border-dashed pt-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        English
      </p>
      {children}
    </div>
  );
}
