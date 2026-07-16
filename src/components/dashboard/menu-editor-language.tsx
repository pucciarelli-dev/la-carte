"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DEFAULT_MENU_LOCALE,
  SUPPORTED_MENU_LOCALES,
  type MenuLocale,
} from "@/lib/locale";

const LOCALE_LABELS: Record<MenuLocale, string> = {
  it: "Italiano",
  en: "English",
};

const LOCALE_SHORT: Record<MenuLocale, string> = {
  it: "IT",
  en: "EN",
};

interface MenuEditorLanguageContextValue {
  locale: MenuLocale;
  setLocale: (locale: MenuLocale) => void;
}

const MenuEditorLanguageContext =
  createContext<MenuEditorLanguageContextValue | null>(null);

export function MenuEditorLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<MenuLocale>(DEFAULT_MENU_LOCALE);

  return (
    <MenuEditorLanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </MenuEditorLanguageContext.Provider>
  );
}

export function useMenuEditorLanguage(): MenuEditorLanguageContextValue {
  const context = useContext(MenuEditorLanguageContext);
  if (!context) {
    throw new Error(
      "useMenuEditorLanguage must be used within MenuEditorLanguageProvider"
    );
  }
  return context;
}

interface DashboardLanguageSelectProps {
  className?: string;
}

export function DashboardLanguageSelect({
  className,
}: DashboardLanguageSelectProps) {
  const { locale, setLocale } = useMenuEditorLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border bg-background p-1",
        className
      )}
      role="group"
      aria-label="Lingua contenuti menu"
    >
      {SUPPORTED_MENU_LOCALES.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 min-w-9 rounded-md px-2 text-xs font-medium shadow-none",
            locale === value
              ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {LOCALE_SHORT[value]}
        </button>
      ))}
    </div>
  );
}

export function MenuEditorLocaleBanner({ className }: { className?: string }) {
  const { locale } = useMenuEditorLanguage();

  if (locale !== "en") return null;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950",
        "dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100",
        className
      )}
      role="status"
    >
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-xs font-bold dark:bg-amber-900/60"
        aria-hidden
      >
        EN
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="font-medium">
          Stai modificando i contenuti in {LOCALE_LABELS.en}
        </p>
        <p className="text-amber-900/80 dark:text-amber-100/80">
          Se un elemento non è ancora tradotto, vedrai il testo italiano come
          base. Modifica i campi per personalizzare la versione inglese.
        </p>
      </div>
    </div>
  );
}
