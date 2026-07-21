"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Eye,
  Pencil,
  Upload,
} from "lucide-react";
import { BrowserFrame } from "@/components/landing/browser-frame";
import {
  DashboardMockup,
  EditorMockup,
  PreviewMockup,
  PublishMockup,
} from "@/components/landing/landing-mockups";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description:
      "Tutti i tuoi menu in un'unica vista. Stato, categorie e versioni a colpo d'occhio.",
    url: "lacarte.tools/dashboard",
  },
  {
    id: "editor",
    label: "Editor",
    icon: Pencil,
    description:
      "Modifica categorie e piatti con drag & drop. Allergeni, prezzi e visibilità in tempo reale.",
    url: "lacarte.tools/dashboard/menu/dinner",
  },
  {
    id: "preview",
    label: "Anteprima",
    icon: Eye,
    description:
      "Visualizza il menu esattamente come lo vedranno i clienti, prima di pubblicarlo.",
    url: "lacarte.tools/menu/anteprima?preview=true",
  },
  {
    id: "publish",
    label: "Pubblicazione",
    icon: Upload,
    description:
      "Quando sei pronto, pubblica con un click. Cronologia completa con ripristino versioni.",
    url: "lacarte.tools/dashboard/menu/dinner",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function LandingShowcase() {
  const [active, setActive] = useState<TabId>("dashboard");
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section className="border-t bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Come funziona
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Dalla dashboard al menu in pochi click
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Un flusso pensato per il personale di sala e cucina: semplice da
            usare, potente sotto il cofano.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active === tab.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="mb-6 text-center text-muted-foreground">
          {current.description}
        </p>

        <BrowserFrame url={current.url}>
          {active === "dashboard" && <DashboardMockup />}
          {active === "editor" && <EditorMockup />}
          {active === "preview" && <PreviewMockup />}
          {active === "publish" && <PublishMockup />}
        </BrowserFrame>
      </div>
    </section>
  );
}
