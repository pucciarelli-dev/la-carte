import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowRight } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <span className="font-semibold">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Accedi</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Inizia ora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            I tuoi menu, sempre aggiornati
          </h1>
          <p className="text-lg text-muted-foreground">
            Gestisci menu dinner, wine e drink da un&apos;unica dashboard.
            Modifica, anteprima e pubblica — senza toccare un PDF.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/login">Accedi alla dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/menu/dinner">Vedi menu demo</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        {APP_NAME} — {APP_TAGLINE}
      </footer>
    </div>
  );
}
