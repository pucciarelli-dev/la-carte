"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import type { MenuType } from "@prisma/client";
import { createMenuAction } from "@/server/actions/menu-actions";
import { slugifyMenuName } from "@/lib/menu-slug";
import { MENU_TYPE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/ui-motion";
import { useDashboardMenus } from "@/components/dashboard/dashboard-menus";
import { useSaveToast } from "@/components/dashboard/save-toast";

const MENU_TYPE_OPTIONS: MenuType[] = ["DINNER", "WINE", "DRINK"];

export function CreateMenuSheet() {
  const router = useRouter();
  const { refreshMenus } = useDashboardMenus();
  const { notifySaved } = useSaveToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [type, setType] = useState<MenuType>("DINNER");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugifyMenuName(name));
    }
  }, [name, slugTouched]);

  const reset = () => {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setType("DINNER");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      const result = await createMenuAction({ name, slug, type });
      await refreshMenus();
      router.refresh();
      reset();
      setOpen(false);
      notifySaved("Menu creato");
      router.push(`/dashboard/menu/${result.slug}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossibile creare il menu"
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (isCreating) return;
        if (!next) reset();
        setOpen(next);
      }}
    >
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nuovo menu
        </Button>
      </SheetTrigger>
      <SheetContent className="max-w-md">
        <SheetHeader>
          <SheetTitle>Nuovo menu</SheetTitle>
          <SheetDescription>
            Il nuovo menu parte da una copia del menu dello stesso tipo già
            presente: categorie, prodotti, intro e impostazioni. Poi modifichi
            quello che ti serve.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="relative">
          {isCreating && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/90 px-6 text-center backdrop-blur-sm"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Creazione menu in corso</p>
                <p className="text-xs text-muted-foreground">
                  Stiamo copiando categorie, prodotti e impostazioni dal menu
                  esistente. Potrebbe richiedere qualche secondo.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="create-menu-name">Nome</Label>
              <Input
                id="create-menu-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Menu Pranzo"
                required
                autoFocus
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-menu-slug">Slug URL</Label>
              <Input
                id="create-menu-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugifyMenuName(e.target.value));
                }}
                placeholder="menu-pranzo"
                required
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Il menu sarà disponibile su /menu/{slug || "..."}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tipo menu</Label>
              <div className="grid gap-2">
                {MENU_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    disabled={isCreating}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-sm transition",
                      type === option
                        ? "border-foreground bg-muted"
                        : "hover:border-foreground/20",
                      isCreating && "pointer-events-none opacity-60"
                    )}
                  >
                    <span className="font-medium">{MENU_TYPE_LABELS[option]}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {option === "DINNER" &&
                        "Copia da Menu Dinner: piatti, categorie e legenda allergeni"}
                      {option === "WINE" &&
                        "Copia da Menu Wine: vini, categorie e layout"}
                      {option === "DRINK" &&
                        "Copia da Menu Drink: drink e categorie"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className={cn("w-full", pressable)}
              disabled={isCreating || !name.trim() || !slug.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creazione in corso...
                </>
              ) : (
                "Crea menu"
              )}
            </Button>
          </form>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
