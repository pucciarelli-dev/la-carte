import { cn } from "@/lib/utils";

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
  className?: string;
}

export function BrowserFrame({ children, url, className }: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background shadow-2xl shadow-black/10",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b bg-muted/60 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/90" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-400/90" />
        </div>
        {url ? (
          <div className="mx-auto min-w-0 flex-1 max-w-xs truncate rounded-md bg-background px-3 py-1 text-center text-[11px] text-muted-foreground sm:max-w-sm">
            {url}
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>
      {children}
    </div>
  );
}
