import {
  Globe,
  History,
  Languages,
  Layers,
  MousePointerClick,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Menu illimitati",
    description:
      "Crea tutti i menu che ti servono — stagionali, speciali, eventi — e gestiscili da un unico posto.",
  },
  {
    icon: MousePointerClick,
    title: "Editor visuale",
    description:
      "Aggiungi voci, riordina con drag & drop e gestisci allergeni senza toccare codice o PDF.",
  },
  {
    icon: Zap,
    title: "Autosalvataggio",
    description:
      "Ogni modifica viene salvata automaticamente. Niente più perdite di lavoro o file dimenticati.",
  },
  {
    icon: History,
    title: "Versioning",
    description:
      "Ogni pubblicazione crea uno snapshot. Ripristina una versione precedente in un attimo.",
  },
  {
    icon: Languages,
    title: "Multilingua",
    description:
      "Gestisci i testi in più lingue direttamente dall'editor, con anteprima immediata.",
  },
  {
    icon: Globe,
    title: "Il tuo dominio",
    description:
      "Pubblica ogni menu con URL sul tuo dominio o sottodominio. Online, sempre aggiornato, senza ristampe.",
  },
];

export function LandingFeatures() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Funzionalità
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tutto ciò che serve al tuo ristorante
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sostituisci i PDF statici con menu digitali sempre aggiornati,
            gestiti dal tuo team in autonomia.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border bg-card p-6 transition-colors hover:border-foreground/20"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
