import { Button } from "@/components/ui/button";

export function LandingCta() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border bg-muted/40 px-8 py-14 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pronto a modernizzare i tuoi menu?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            Accedi alla dashboard, crea il tuo primo menu e pubblicalo in pochi
            minuti. Nessuna configurazione complessa.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <Button size="lg" asChild>
              <a href="mailto:info@giuseppepucciarelli.it">Contattaci</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
