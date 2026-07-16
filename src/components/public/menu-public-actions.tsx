"use client";

import { Suspense } from "react";
import { MenuLanguageSwitcher } from "@/components/public/menu-language-switcher";
import { MenuPageActions } from "@/components/public/menu-page-actions";

interface MenuPublicActionsProps {
  slug: string;
  showBackToEditor?: boolean;
}

export function MenuPublicActions({
  slug,
  showBackToEditor = false,
}: MenuPublicActionsProps) {
  return (
    <div className="menu-print-chrome flex items-center gap-2">
      <Suspense fallback={null}>
        <MenuLanguageSwitcher />
      </Suspense>
      <MenuPageActions slug={slug} showBackToEditor={showBackToEditor} />
    </div>
  );
}
