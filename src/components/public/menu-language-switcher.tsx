"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DEFAULT_MENU_LOCALE,
  SUPPORTED_MENU_LOCALES,
  type MenuLocale,
} from "@/lib/locale";

const LABELS: Record<MenuLocale, string> = {
  it: "IT",
  en: "EN",
};

interface MenuLanguageSwitcherProps {
  className?: string;
}

export function MenuLanguageSwitcher({ className }: MenuLanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale: MenuLocale =
    searchParams.get("lang") === "en" ? "en" : DEFAULT_MENU_LOCALE;

  function hrefFor(locale: MenuLocale) {
    const params = new URLSearchParams(searchParams.toString());
    if (locale === "en") params.set("lang", "en");
    else params.delete("lang");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-1 menu-print-chrome",
        className
      )}
      role="group"
      aria-label="Lingua menu"
    >
      {SUPPORTED_MENU_LOCALES.map((locale, index) => (
        <span key={locale} className="inline-flex items-center">
          {index > 0 && (
            <span className="px-0.5 text-xs leading-none text-white/35" aria-hidden>
              |
            </span>
          )}
          <Link
            href={hrefFor(locale)}
            scroll={false}
            className={cn(
              "inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded px-1.5 text-xs font-medium leading-none tracking-wide transition",
              currentLocale === locale
                ? "text-white"
                : "text-white/50 hover:text-white/80"
            )}
          >
            {LABELS[locale]}
          </Link>
        </span>
      ))}
    </div>
  );
}
