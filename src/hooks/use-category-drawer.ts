"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SHEET_CLOSE_MS } from "@/lib/ui-motion";

export function useCategoryDrawer() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const openDrawer = useCallback((categoryId: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveCategoryId(categoryId);
    setOpen(true);
  }, []);

  const onOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    setOpen(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveCategoryId(null);
    }, SHEET_CLOSE_MS);
  }, []);

  const closeImmediately = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpen(false);
    setActiveCategoryId(null);
  }, []);

  return {
    activeCategoryId,
    open,
    openDrawer,
    onOpenChange,
    closeImmediately,
  };
}
