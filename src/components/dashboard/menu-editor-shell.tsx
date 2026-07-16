"use client";

import { MenuEditorLanguageProvider } from "@/components/dashboard/menu-editor-language";
import { MenuEditorSaveProvider } from "@/components/dashboard/menu-editor-save";

export function MenuEditorShell({ children }: { children: React.ReactNode }) {
  return (
    <MenuEditorLanguageProvider>
      <MenuEditorSaveProvider>{children}</MenuEditorSaveProvider>
    </MenuEditorLanguageProvider>
  );
}
