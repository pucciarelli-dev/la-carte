import Link from "next/link";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingShowcase } from "@/components/landing/landing-showcase";
import { LandingCta } from "@/components/landing/landing-cta";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <span className="font-semibold">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="/login">
                Accedi alla dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingShowcase />
        <LandingCta />
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        {APP_NAME} — {APP_TAGLINE}
      </footer>
    </div>
  );
}
