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
  debounceMs = 1500,
  trigger,
  hasChanges,
}: AutosaveIndicatorProps) {
  const saveToast = useSaveToastOptional();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const hasChangesRef = useRef(hasChanges);
  const onSaveRef = useRef(onSave);

  hasChangesRef.current = hasChanges;
  onSaveRef.current = onSave;

  const save = useCallback(() => {
    if (!hasChangesRef.current()) return;

    saveToast?.notifySavingStart();
    void (async () => {
      try {
        const saved = await onSaveRef.current();
        if (saved) {
          saveToast?.notifySaved();
        } else {
          saveToast?.notifySavingEnd();
        }
      } catch {
        saveToast?.notifySavingEnd();
      }
    })();
  }, [saveToast]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!hasChanges()) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [trigger, debounceMs, save, hasChanges]);

  return null;
}
