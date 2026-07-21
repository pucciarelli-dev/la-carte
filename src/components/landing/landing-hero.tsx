import {
  Globe,
  History,
  LayoutDashboard,
  Layers,
  Upload,
} from "lucide-react";

const pills = [
  { icon: Layers, label: "Menu illimitati" },
  { icon: Globe, label: "Il tuo dominio" },
  { icon: LayoutDashboard, label: "Dashboard unica" },
  { icon: Upload, label: "Pubblica in un click" },
  { icon: History, label: "Versioni & ripristino" },
];

const steps = [
  {
    number: "01",
    title: "Modifica",
    body: "Aggiorna voci e categorie in modo intuitivo.",
  },
  {
    number: "02",
    title: "Anteprima",
    body: "Vedi subito come apparirà sul menu.",
  },
  {
    number: "03",
    title: "Pubblica",
    body: "Genera URL sul tuo dominio e vai online.",
  },
];

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-br from-muted/60 to-transparent" />
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-bl from-muted/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--muted)/0.4),transparent)]" />
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:pb-32 lg:pt-28">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            La Carte
          </span>
        </div>

        {/* Headline */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[5rem]">
            Gestisci i tuoi menu.
            <br />
            <span className="text-muted-foreground">In modo semplice.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Tutti i tuoi menu, in un unico posto. Sempre aggiornati e
            pubblicati sul tuo dominio.
          </p>
        </div>

        {/* Funzioni principali */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {pills.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              {label}
            </span>
          ))}
        </div>

        {/* Steps */}
        <div className="mx-auto mt-20 max-w-4xl">
          <div className="grid gap-px rounded-2xl border bg-border sm:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className={[
                  "flex flex-col gap-3 bg-background p-7",
                  i === 0 && "rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none",
                  i === steps.length - 1 && "rounded-b-2xl sm:rounded-r-2xl sm:rounded-bl-none",
                ].filter(Boolean).join(" ")}
              >
                <span className="text-xs font-medium text-muted-foreground/60">{step.number}</span>
                <p className="text-lg font-semibold">{step.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
