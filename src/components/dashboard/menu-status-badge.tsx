import type { MenuStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  MenuStatus,
  { label: string; variant: "default" | "secondary" | "warning" | "success" }
> = {
  DRAFT: { label: "Bozza", variant: "secondary" },
  PREVIEW: { label: "Anteprima", variant: "warning" },
  PUBLISHED: { label: "Pubblicato", variant: "success" },
};

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
