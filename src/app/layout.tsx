import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-bistrot-serif",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Gestisci i menu del tuo ristorante in modo semplice e professionale.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans`}
        suppressHydrationWarning
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
