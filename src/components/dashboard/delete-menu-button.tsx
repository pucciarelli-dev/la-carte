"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteMenuAction } from "@/server/actions/menu-actions";
import { useDashboardMenus } from "@/components/dashboard/dashboard-menus";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/ui-motion";

interface DeleteMenuButtonProps {
  menuId: string;
  menuName: string;
  redirectTo?: string;
  variant?: "icon" | "button";
  className?: string;
}

export function DeleteMenuButton({
  menuId,
  menuName,
  redirectTo = "/dashboard",
  variant = "icon",
  className,
}: DeleteMenuButtonProps) {
  const router = useRouter();
  const { refreshMenus } = useDashboardMenus();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteMenuAction(menuId);
        await refreshMenus();
        setOpen(false);
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Impossibile eliminare il menu"
        );
      }
    });
  };

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-destructive",
            className
          )}
          aria-label={`Elimina ${menuName}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "text-destructive hover:bg-destructive/5 hover:text-destructive",
            className
          )}
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Elimina menu
        </Button>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-w-md">
          <SheetHeader>
            <SheetTitle>Elimina menu</SheetTitle>
            <SheetDescription>
              Stai per eliminare <strong>{menuName}</strong>. Verranno rimossi
              anche categorie, prodotti e versioni pubblicate. L&apos;azione non
              è reversibile.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4">
            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Annulla
              </Button>
              <Button
                type="button"
                variant="destructive"
                className={cn("flex-1", pressable)}
                disabled={isPending}
                onClick={handleDelete}
              >
                {isPending ? "Eliminazione..." : "Elimina definitivamente"}
              </Button>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}
