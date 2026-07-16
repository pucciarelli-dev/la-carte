import { requireAuth } from "@/lib/auth-utils";
import { CreateMenuSheet } from "@/components/dashboard/create-menu-sheet";
import { DashboardMenuGrid } from "@/components/dashboard/dashboard-menu-grid";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Benvenuto, {session.user.name ?? session.user.email}
          </p>
        </div>
        <CreateMenuSheet />
      </div>

      <DashboardMenuGrid />
    </div>
  );
}
