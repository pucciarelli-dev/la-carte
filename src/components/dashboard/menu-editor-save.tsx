"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useEffect,
} from "react";

type FlushSave = () => Promise<void>;

interface MenuEditorSaveContextValue {
  register: (flush: FlushSave) => () => void;
  flush: () => Promise<void>;
}

const MenuEditorSaveContext = createContext<MenuEditorSaveContextValue | null>(
  null
);

export function MenuEditorSaveProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const flushRef = useRef<FlushSave | null>(null);

  const register = useCallback((flush: FlushSave) => {
    flushRef.current = flush;
    return () => {
      if (flushRef.current === flush) {
        flushRef.current = null;
      }
    };
  }, []);

  const flush = useCallback(async () => {
    await flushRef.current?.();
  }, []);

  return (
    <MenuEditorSaveContext.Provider value={{ register, flush }}>
      {children}
    </MenuEditorSaveContext.Provider>
  );
}

export function useRegisterMenuEditorSave(flush: FlushSave) {
  const context = useContext(MenuEditorSaveContext);
  if (!context) {
    throw new Error(
      "useRegisterMenuEditorSave must be used within MenuEditorSaveProvider"
    );
  }

  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    return context.register(async () => flushRef.current());
  }, [context]);
}

export function useFlushMenuEditorSave(): () => Promise<void> {
  const context = useContext(MenuEditorSaveContext);
  if (!context) {
    return async () => {};
  }
  return context.flush;
}
