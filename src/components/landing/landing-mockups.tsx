import {
  ArrowLeft,
  ArrowRight,
  Download,
  Eye,
  GripVertical,
  History,
  Monitor,
  Smartphone,
  Upload,
  UtensilsCrossed,
  Wine,
  GlassWater,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function MockSidebar({ active = "dashboard" }: { active?: string }) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "dinner", label: "Menu Dinner" },
    { id: "wine", label: "Menu Wine" },
    { id: "drink", label: "Menu Drink" },
    { id: "settings", label: "Impostazioni" },
  ];

  return (
    <div className="hidden w-36 shrink-0 border-r bg-sidebar p-3 sm:block">
      <div className="mb-4 flex items-center gap-2 px-1">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] text-primary-foreground">
          LC
        </div>
        <span className="text-xs font-semibold">La Carte</span>
      </div>
      <nav className="space-y-0.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-md px-2 py-1.5 text-[11px]",
              item.id === active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
}

export function DashboardMockup() {
  const menus = [
    {
      name: "Menu Dinner",
      icon: UtensilsCrossed,
      categories: 6,
      versions: 12,
      status: "Pubblicato" as const,
    },
    {
      name: "Menu Wine",
      icon: Wine,
      categories: 4,
      versions: 8,
      status: "Anteprima" as const,
    },
    {
      name: "Menu Drink",
      icon: GlassWater,
      categories: 3,
      versions: 5,
      status: "Bozza" as const,
    },
  ];

  const statusVariant = {
    Pubblicato: "success",
    Anteprima: "warning",
    Bozza: "secondary",
  } as const;

  return (
    <div className="flex h-full min-h-[320px] bg-background text-left">
      <MockSidebar active="dashboard" />
      <div className="flex-1 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Dashboard</p>
            <p className="text-[11px] text-muted-foreground">
              Benvenuto, admin@demo.it
            </p>
          </div>
          <div className="rounded-md bg-primary px-2.5 py-1 text-[10px] font-medium text-primary-foreground">
            + Nuovo menu
          </div>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => {
            const Icon = menu.icon;
            return (
              <div
                key={menu.name}
                className="rounded-lg border p-3 transition-colors hover:border-foreground/20"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">{menu.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {menu.categories} categorie
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={statusVariant[menu.status]}
                    className="px-1.5 py-0 text-[9px]"
                  >
                    {menu.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{menu.versions} versioni pubblicate</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function EditorMockup() {
  const items = [
    { name: "Carpaccio di manzo", price: "18", visible: true },
    { name: "Burrata con pomodorini", price: "14", visible: true },
    { name: "Tagliere di salumi", price: "22", visible: false },
    { name: "Risotto ai funghi", price: "24", visible: true },
  ];

  return (
    <div className="flex h-full min-h-[320px] bg-background text-left">
      <MockSidebar active="dinner" />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold">Menu Dinner</p>
            <Badge variant="warning" className="px-1.5 py-0 text-[9px]">
              Anteprima
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-md border px-2 py-1 text-[10px]">
              <Eye className="h-3 w-3" />
              Anteprima
            </div>
            <div className="rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground">
              Pubblica
            </div>
          </div>
        </div>
        <div className="flex flex-1">
          <div className="w-28 shrink-0 border-r p-3 sm:w-36">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Categorie
            </p>
            {["Antipasti", "Primi", "Secondi", "Dessert"].map((cat, i) => (
              <div
                key={cat}
                className={cn(
                  "mb-0.5 rounded-md px-2 py-1.5 text-[11px]",
                  i === 0
                    ? "bg-muted font-medium"
                    : "text-muted-foreground"
                )}
              >
                {cat}
              </div>
            ))}
          </div>
          <div className="flex-1 p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium">Antipasti</p>
              <div className="rounded-md border px-2 py-0.5 text-[10px]">
                + Piatto
              </div>
            </div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-2 py-2",
                    !item.visible && "opacity-50"
                  )}
                >
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium">
                      {item.name}
                    </p>
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    €{item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PreviewMockup() {
  return (
    <div className="flex h-full min-h-[380px] flex-col overflow-hidden bg-[#ececec] text-left">
      <header className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-[#1a1a1a] px-3 text-white">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-white/80">
          <ArrowLeft className="h-3 w-3" />
          Torna all&apos;editor
        </div>

        <div className="flex items-center gap-0.5 rounded-md bg-white/10 p-0.5">
          <div className="inline-flex h-6 w-7 items-center justify-center rounded bg-white text-[#1a1a1a] shadow-sm">
            <Smartphone className="h-3 w-3" />
          </div>
          <div className="inline-flex h-6 w-7 items-center justify-center rounded text-white/60">
            <Monitor className="h-3 w-3" />
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="inline-flex h-6 items-center gap-1 rounded border border-white/20 bg-white/10 px-2 text-[9px] text-white">
            <Download className="h-2.5 w-2.5" />
            Scarica PDF
          </div>
          <p className="text-[9px] text-amber-300/90">Anteprima — non pubblicato</p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-5">
        <div
          className="overflow-hidden rounded-[1.25rem] bg-white shadow-2xl ring-1 ring-black/10"
          style={{ width: 180, height: 300 }}
        >
          <div className="relative flex h-full flex-col bg-neutral-900 text-white">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/80" />
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 35%, rgba(120,80,50,0.5), transparent 60%)",
              }}
            />

            <div className="relative z-10 flex items-center justify-end px-3 pt-3 text-[8px] tracking-wide text-white/80">
              <span className="font-medium text-white">IT</span>
              <span className="mx-1 text-white/40">|</span>
              <span>EN</span>
            </div>

            <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 text-center">
              <p className="font-serif text-sm italic text-white/90">Il tuo locale</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-white/70">
                Ristorante
              </p>
              <p
                className="mt-6 text-2xl font-light uppercase tracking-[0.15em] text-transparent"
                style={{ WebkitTextStroke: "1px rgba(255,255,255,0.9)" }}
              >
                Menù
              </p>
              <p className="mt-2 text-[8px] uppercase tracking-[0.3em] text-white/80">
                A la carte
              </p>
            </div>

            <div className="relative z-10 px-3 pb-3 text-center text-[7px] uppercase tracking-[0.12em] text-white/60">
              Via del tuo locale 1 · Milano
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublishMockup() {
  const versions = [
    { v: 12, date: "21 lug 2026, 09:14" },
    { v: 11, date: "18 lug 2026, 14:32" },
    { v: 10, date: "15 lug 2026, 11:05" },
  ];

  return (
    <div className="flex h-full min-h-[320px] flex-col bg-background text-left">
      <div className="border-b px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold">Pubblicazione</p>
            <p className="text-[11px] text-muted-foreground">
              Menu Dinner — versione 12 attiva
            </p>
          </div>
          <Badge variant="success" className="text-[9px]">
            Pubblicato
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:flex-row sm:p-5">
        <div className="flex-1 space-y-3">
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Upload className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium">Pubblica online</p>
            </div>
            <p className="mb-3 text-[11px] text-muted-foreground">
              Genera lo snapshot e aggiorna il menu pubblico con un click.
            </p>
            <div className="rounded-md bg-primary px-3 py-1.5 text-center text-[11px] font-medium text-primary-foreground">
              Pubblica ora
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-medium">Anteprima sicura</p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Controlla le modifiche prima di renderle visibili ai clienti.
            </p>
          </div>
        </div>
        <div className="flex-1 rounded-lg border p-3">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-medium">Cronologia versioni</p>
          </div>
          <div className="space-y-2">
            {versions.map((ver, i) => (
              <div
                key={ver.v}
                className={cn(
                  "flex items-center justify-between rounded-md border px-2.5 py-2",
                  i === 0 && "border-foreground/20 bg-muted/40"
                )}
              >
                <div>
                  <p className="text-[11px] font-medium">v{ver.v}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ver.date}
                  </p>
                </div>
                {i > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    Ripristina
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
