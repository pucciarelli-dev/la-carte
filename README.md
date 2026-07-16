# La Carte — Restaurant Menu CMS

Sistema multi-tenant per la gestione dei menu di ristoranti. Permette al personale di modificare menu dinner, wine e drink da una dashboard, con workflow bozza → anteprima → pubblicazione e versioning.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (Radix UI)
- **Prisma** + **PostgreSQL**
- **NextAuth.js v5** (Auth.js)
- **Zod** + **React Hook Form**
- **@dnd-kit** (drag & drop)

## Architettura

```
src/
├── app/                    # Next.js App Router
│   ├── dashboard/          # Area admin protetta
│   ├── menu/[slug]/        # Pagine pubbliche menu
│   ├── api/                # REST API
│   └── login/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Editor, sidebar, publish bar
│   └── public/             # Rendering menu pubblico
├── lib/                    # Utilities, auth, db, tenant
├── server/
│   ├── actions/            # Server Actions (CRUD)
│   └── repositories/       # Data access layer
└── types/                  # TypeScript types
```

### Multi-tenancy

Ogni ristorante è un **Tenant** con dati completamente isolati:

- Risoluzione tenant via **subdomain** (`demo.carte.app`) o **dominio custom**
- Tutte le tabelle hanno `tenantId` con foreign key e indici
- La sessione Auth include `tenantId` per scope automatico

### Workflow pubblicazione

1. **Bozza** — modifiche salvate automaticamente nelle tabelle draft
2. **Anteprima** — visualizzazione del menu non pubblicato
3. **Pubblica** — snapshot JSON salvato in `menu_versions`, URL pubblico aggiornato
4. **Cronologia** — tutte le versioni pubblicate sono recuperabili e ripristinabili

## Setup locale

### Prerequisiti

- Node.js 20+
- PostgreSQL

### Installazione

```bash
# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp .env.example .env
# Modifica DATABASE_URL e AUTH_SECRET

# Genera client Prisma e crea tabelle
npm run db:generate
npm run db:push

# Popola dati demo
npm run db:seed

# Avvia dev server
npm run dev
```

### Credenziali demo

- **Email:** admin@demo.it
- **Password:** password123

## URL

| Area | URL |
|------|-----|
| Dashboard | `/dashboard` |
| Menu Dinner (editor) | `/dashboard/menu/dinner` |
| Menu Wine (editor) | `/dashboard/menu/wine` |
| Menu Drink (editor) | `/dashboard/menu/drink` |
| Menu pubblico Dinner | `/menu/dinner` |
| Menu pubblico Wine | `/menu/wine` |
| Menu pubblico Drink | `/menu/drink` |
| API pubblica | `/api/menu/{slug}` |

## Layout menu

Ogni menu supporta template grafici selezionabili dalla dashboard:

| Layout | Tipo | Riferimento |
|--------|------|-------------|
| **Classico** | Tutti | Layout minimale generico |
| **Bistrot — Cena** | Dinner | [menu-dinner.pdf](https://bistrot.southgarage.com/wp-content/uploads/2026/03/menu-dinner.pdf) |
| **Bistrot — Vini** | Wine | [MENU_WINE.pdf](https://bistrot.southgarage.com/wp-content/uploads/2026/03/MENU_WINE-nov_2025_compressed-1.pdf) |
| **Bistrot — Drink** | Drink | [menu_DRINK.pdf](https://bistrot.southgarage.com/wp-content/uploads/2025/10/menu_DRINK.pdf) |

- **Dashboard → Menu** — selettore layout per ogni menu
- **Dashboard → Impostazioni** — branding (nome, indirizzo, tagline, testo introduttivo)
- **Anteprima** — `/menu/{slug}?preview=true` mostra il draft con il layout scelto

## Roadmap

- [x] **Fase 1** — Auth, dashboard, database, CRUD menu
- [x] **Fase 2** — Sito pubblico, rendering menu, layout Bistrot
- [ ] **Fase 3** — Esportazione PDF (React PDF / Puppeteer)
- [x] **Fase 4** — Versioning (publish, cronologia, ripristino)
- [ ] **Fase 5** — Ottimizzazioni, multi-dominio, utenti

## Deploy (Vercel)

1. Collega il repository a Vercel
2. Configura `DATABASE_URL` (consigliato: Neon, Supabase, o Vercel Postgres)
3. Configura `AUTH_SECRET` e `AUTH_URL`
4. Esegui `npx prisma db push` nel build step

## Licenza

Proprietario — tutti i diritti riservati.
