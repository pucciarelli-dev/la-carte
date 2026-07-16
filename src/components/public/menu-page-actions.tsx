import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface MenuPageActionsProps {
  slug: string;
  showBackToEditor?: boolean;
}

export function MenuPageActions({
  slug,
  showBackToEditor = false,
}: MenuPageActionsProps) {
  if (!showBackToEditor) return null;

  return (
    <Link
      href={`/dashboard/menu/${slug}`}
      className="menu-print-chrome inline-flex h-8 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Torna all&apos;editor
    </Link>
  );
}
