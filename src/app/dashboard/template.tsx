import { pageEnter } from "@/lib/ui-motion";

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={pageEnter}>{children}</div>;
}
