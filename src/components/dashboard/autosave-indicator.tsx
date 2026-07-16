"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSaveToastOptional } from "@/components/dashboard/save-toast";

interface AutosaveIndicatorProps {
  onSave: () => Promise<boolean>;
  debounceMs?: number;
  trigger: number;
  hasChanges: () => boolean;
}

export function AutosaveIndicator({
  onSave,
  debounceMs = 800,
  trigger,
  hasChanges,
}: AutosaveIndicatorProps) {
  const saveToast = useSaveToastOptional();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const hasChangesRef = useRef(hasChanges);
  const onSaveRef = useRef(onSave);
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);

  hasChangesRef.current = hasChanges;
  onSaveRef.current = onSave;

  const runSave = useCallback(async () => {
    if (inFlightRef.current) {
      pendingRef.current = true;
      return;
    }
    if (!hasChangesRef.current()) return;

    inFlightRef.current = true;
    saveToast?.notifySavingStart();

    try {
      let savedAny = false;
      do {
        pendingRef.current = false;
        if (!hasChangesRef.current()) break;
        const saved = await onSaveRef.current();
        if (saved) savedAny = true;
      } while (pendingRef.current);

      if (savedAny) {
        saveToast?.notifySaved();
      } else {
        saveToast?.notifySavingEnd();
      }
    } catch {
      saveToast?.notifySavingEnd();
    } finally {
      inFlightRef.current = false;
      if (pendingRef.current && hasChangesRef.current()) {
        pendingRef.current = false;
        void runSave();
      }
    }
  }, [saveToast]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!hasChanges()) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runSave();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trigger, debounceMs, runSave, hasChanges]);

  return null;
}
