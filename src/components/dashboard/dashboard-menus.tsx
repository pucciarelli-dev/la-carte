"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { MenuStatus, MenuType } from "@prisma/client";
import { getDashboardMenusAction } from "@/server/actions/menu-actions";

export interface DashboardMenuSummary {
  id: string;
  name: string;
  slug: string;
  type: MenuType;
  status: MenuStatus;
  categoryCount: number;
  versionCount: number;
}

interface DashboardMenusContextValue {
  menus: DashboardMenuSummary[];
  refreshMenus: () => Promise<void>;
}

const DashboardMenusContext = createContext<DashboardMenusContextValue | null>(
  null
);

export function DashboardMenusProvider({
  initialMenus,
  children,
}: {
  initialMenus: DashboardMenuSummary[];
  children: ReactNode;
}) {
  const [menus, setMenus] = useState(initialMenus);

  useEffect(() => {
    setMenus(initialMenus);
  }, [initialMenus]);

  const refreshMenus = useCallback(async () => {
    const next = await getDashboardMenusAction();
    setMenus(next);
  }, []);

  return (
    <DashboardMenusContext.Provider value={{ menus, refreshMenus }}>
      {children}
    </DashboardMenusContext.Provider>
  );
}

export function useDashboardMenus() {
  const context = useContext(DashboardMenusContext);
  if (!context) {
    throw new Error(
      "useDashboardMenus must be used within DashboardMenusProvider"
    );
  }
  return context;
}
