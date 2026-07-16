"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { updateMenuIdentityAction } from "@/server/actions/menu-actions";
import { normalizeMenuSlug, slugifyMenuName } from "@/lib/menu-slug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSaveToast } from "@/components/dashboard/save-toast";
import { useDashboardMenus } from "@/components/dashboard/dashboard-menus";

interface MenuIdentityEditorProps {
  menuId: string;
  menuName: string;
  menuSlug: string;
}

export function MenuIdentityEditor({
  menuId,
  menuName,
  menuSlug,
}: MenuIdentityEditorProps) {
  const router = useRouter();
  const { notifySaved } = useSaveToast();
  const { refreshMenus } = useDashboardMenus();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(menuName);
  const [slug, setSlug] = useState(menuSlug);
  const [slugTouched, setSlugTouched] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setName(menuName);
    setSlug(menuSlug);
    setSlugTouched(true);
    setError(null);
  }, [open, menuName, menuSlug]);

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugifyMenuName(name));
    }
  }, [name, slugTouched]);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await updateMenuIdentityAction(menuId, {
          name,
          slug: normalizeMenuSlug(slug),
        });
        await refreshMenus();
        notifySaved("Menu aggiornato");
        setOpen(false);
        if (result.slugChanged) {
          router.replace(`/dashboard/menu/${result.slug}`);
          router.refresh();
          return;
        }
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Impossibile aggiornare il menu"
        );
      }
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{menuName}</h1>
          <p className="text-muted-foreground">
            Modifica il menu e pubblica quando sei pronto
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            URL La Carte:{" "}
            <span className="font-medium text-foreground">/menu/{menuSlug}</span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Pencil className="h-4 w-4" />
          Rinomina / URL
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Nome e URL menu</SheetTitle>
            <SheetDescription>
              Puoi cambiare il nome e lo slug usato su La Carte
              (<code className="text-xs">/menu/…</code>).
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menu-name">Nome</Label>
              <Input
                id="menu-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Menu Dinner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-slug">Slug URL</Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-muted-foreground">
                  /menu/
                </span>
                <Input
                  id="menu-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="dinner"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Solo lettere minuscole, numeri e trattini. Anteprima:{" "}
                <span className="font-medium text-foreground">
                  /menu/{normalizeMenuSlug(slug || name) || "…"}
                </span>
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Annulla
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isPending || !name.trim()}
              >
                {isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}
