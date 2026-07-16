"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pressable } from "@/lib/ui-motion";

interface ListPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function ListPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: ListPaginationProps) {
  return (
    <nav
      className="flex flex-col items-center gap-2 border-t pt-4"
      aria-label="Paginazione"
    >
      <p className="text-xs text-muted-foreground">
        Pagina {page} di {totalPages} · {totalItems} vini
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={pressable}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Precedente
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={pressable}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Successiva
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
