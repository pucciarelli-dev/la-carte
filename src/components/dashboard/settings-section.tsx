import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  icon,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3 border-b bg-muted/30 px-4 py-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

interface SettingsFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsField({
  label,
  hint,
  children,
  className,
}: SettingsFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div>
        <p className="text-sm font-medium leading-none">{label}</p>
        {hint && (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}
