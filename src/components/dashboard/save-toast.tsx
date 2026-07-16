"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastEnter } from "@/lib/ui-motion";

interface SaveToastContextValue {
  notifySavingStart: () => void;
  notifySavingEnd: () => void;
  notifySaved: (message?: string) => void;
}

const SaveToastContext = createContext<SaveToastContextValue | null>(null);

const savingBannerEnter =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:zoom-in-95 duration-300 ease-in-out";

export function SaveToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; key: number } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingCountRef = useRef(0);

  const notifySavingStart = useCallback(() => {
    savingCountRef.current += 1;
    setIsSaving(true);
  }, []);

  const notifySavingEnd = useCallback(() => {
    savingCountRef.current = Math.max(0, savingCountRef.current - 1);
    if (savingCountRef.current === 0) {
      setIsSaving(false);
    }
  }, []);

  const notifySaved = useCallback((message = "Modifiche salvate") => {
    notifySavingEnd();
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, key: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), 2600);
  }, [notifySavingEnd]);

  return (
    <SaveToastContext.Provider
      value={{ notifySavingStart, notifySavingEnd, notifySaved }}
    >
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
      >
        {isSaving && (
          <div
            className={cn(
              savingBannerEnter,
              "flex items-center gap-2.5 rounded-lg border border-foreground/10 bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg"
            )}
          >
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            Salvataggio in corso...
          </div>
        )}
      </div>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2"
      >
        {toast && (
          <div
            key={toast.key}
            className={cn(
              toastEnter,
              "flex items-center gap-2 rounded-full border bg-background/95 px-4 py-2.5 text-sm backdrop-blur-sm",
              "text-foreground"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
              <Check className="h-3 w-3 text-emerald-600" />
            </span>
            {toast.message}
          </div>
        )}
      </div>
    </SaveToastContext.Provider>
  );
}

export function useSaveToast() {
  const context = useContext(SaveToastContext);
  if (!context) {
    throw new Error("useSaveToast must be used within SaveToastProvider");
  }
  return context;
}

export function useSaveToastOptional() {
  return useContext(SaveToastContext) ?? undefined;
}
