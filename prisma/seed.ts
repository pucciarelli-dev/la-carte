import { PrismaClient, MenuType, MenuLayout, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_MENU_ALLERGENS } from "../src/lib/allergens";
import { BISTROT_MENU_TYPOGRAPHY } from "../src/lib/google-fonts";
import {
  WINE_CATEGORIES,
  type SeedWineItem,
} from "./seed-wine-data";

const defaultAllergenLegend = DEFAULT_MENU_ALLERGENS as unknown as Prisma.InputJsonValue;
const defaultTypography = BISTROT_MENU_TYPOGRAPHY as unknown as Prisma.InputJsonValue;

const DEFAULT_BRANDING = {
  displayName: "BISTROT",
  address: "Via Eugenio Brizi 4 MILANO",
  tagline: "CONTEMPORARY DINING EXPERIENCE",
  coverCharge: 3.5,
  introText:
    'Un menù di "FINE DINING" che si caratterizza per una cucina semplice, basata sul sapiente uso della materia prima e su tecniche di preparazione sofisticate. Un approccio orientato alla qualità in un contesto di piena informalità, ideale per chi predilige stile e sostanza.',
  introTextSecondary:
    "Piatti leggibili, riconoscibili, di matrice italiana, ma aperti alle contaminazioni del mondo, espressione di una cucina contemporanea e ricercata e allo stesso tempo, rigorosa ed evocativa, che non tradisce mai l'etica pur rendendo onore all'estetica.",
  showAllergenLegend: true,
  footerNoteIt:
    "Il costo del coperto è di 3,5 euro a persona. Tutti i prezzi presenti nel menu sono in euro.",
  newsletterText:
    "Se vuoi ricevere novità e comunicazioni, iscriviti alla nostra newsletter.",
  newsletterTextEn:
    "If you'd like to receive news and updates, subscribe to our newsletter.",
  newsletterLinkLabelEn: "subscribe to our newsletter",
};

function buildDinnerIntro(tenantId: string, menuId: string) {
  const base = `/uploads/${tenantId}/${menuId}`;
  return {
    logoUrl: `${base}/intro-logo.png`,
    sectionLogoUrl: `${base}/intro-section-logo.png`,
    heroTitle: "MENÙ",
    address: DEFAULT_BRANDING.address,
    sectionTitle: "LA NOSTRA\nIDEA DI CUCINA",
    bodyText: DEFAULT_BRANDING.introText,
    bodyImageUrl: `${base}/intro-body-image.png`,
    bodyImageTagline: DEFAULT_BRANDING.tagline,
    bodyTextSecondary: DEFAULT_BRANDING.introTextSecondary,
    footerNoteIt: DEFAULT_BRANDING.footerNoteIt,
  };
}

function mergeIntro(
  current: unknown,
  next: Record<string, unknown>
): Prisma.InputJsonValue {
  const base =
    current && typeof current === "object"
      ? (current as Record<string, unknown>)
      : {};
  return { ...base, ...next } as Prisma.InputJsonValue;
}

const prisma = new PrismaClient();

const DINNER_ANTIPASTI = [
  {
    idSuffix: "uovo-nel-bosco",
    name: "UOVO NEL BOSCO",
    description:
      "UOVO CBT | *CREMA DI FUNGHI | FUNGHI CROCCANTI | PEPE AFFUMICATO",
    price: 16,
    order: 0,
    allergens: ["3", "7"],
  },
  {
    idSuffix: "battuta-di-fassona",
    name: "BATTUTA DI FASSONA",
    description: "BATTUTA DI FASSONA | BERNESE | NOCCIOLA | CHIPS DI PATATE",
    price: 20,
    order: 1,
    allergens: ["1", "3", "7", "8", "12"],
  },
  {
    idSuffix: "gamberi-patate-carciofi",
    name: "GAMBERI PATATE E CARCIOFI",
    description:
      "CREMA DI PATATE | FUMETTO DI PESCE | *GAMBERI SCOTTATI | CHIPS DI CARCIOFI",
    price: 20,
    order: 2,
    allergens: ["1", "2", "7", "8", "12"],
  },
  {
    idSuffix: "vitello-tonnato",
    name: "VITELLO TONNATO",
    description: "MAGATELLO A LUNGA COTTURA | SALSA TONNATA | FONDO BRUNO",
    price: 18,
    order: 3,
    allergens: ["3", "4", "9"],
  },
  {
    idSuffix: "insalata-di-mare",
    name: "INSALATA DI MARE",
    description:
      "*SEPPIA | *POLPO | CAROTE | SEDANO | OLIVE TAGGIASCHE | SUCCO DI LIMONE",
    price: 18,
    order: 4,
    allergens: ["2", "9", "14"],
  },
] as const;

const DINNER_PRIMI = [
  {
    idSuffix: "fregola-di-mare",
    name: "FREGOLA DI MARE",
    description: "FREGOLA | CREMA DI ZUCCHINE TROMBETTA | COZZE | MENTA",
    price: 22,
    order: 0,
    allergens: ["1", "14"],
  },
  {
    idSuffix: "fusillone-al-ragu",
    name: "FUSILLONE AL RAGÙ",
    description:
      "PASTA FRESCA ALL'UOVO | RAGÙ DI SUINO NERO | FONDUTA DI PARMIGIANO | POLVERE DI FUNGHI",
    price: 20,
    order: 1,
    allergens: ["1", "3", "8", "9", "12"],
  },
  {
    idSuffix: "spaghetti-e-gamberi",
    name: "SPAGHETTI E GAMBERI",
    description:
      "SPAGHETTI TRAFILATI AL BRONZO | BISQUE | *TARTARE DI GAMBERO | LIME E MENTA",
    price: 22,
    order: 2,
    allergens: ["1", "2", "3", "9"],
  },
  {
    idSuffix: "ravioli-al-salmerino",
    name: "RAVIOLI AL SALMERINO",
    description:
      "RAVIOLI DI PASTA FRESCA AL SALMERINO | BURRO D'ALPEGGIO | POMODORINO DRY",
    price: 24,
    order: 3,
    allergens: ["1", "4", "7"],
  },
] as const;

const DINNER_SECONDI = [
  {
    idSuffix: "ombrina",
    name: "OMBRINA",
    description:
      "FILETTO DI OMBRINA BOCCADORO CBT | ZUCCHINE ALLA SCAPECE | SALSA DI POMODORO SAN MARZANO CON FINOCCHIO E ACCIUGHE",
    price: 26,
    order: 0,
    allergens: ["1", "4"],
  },
  {
    idSuffix: "seppia-cbt",
    name: "SEPPIA CBT",
    description:
      "*SEPPIA CBT | CREMOSO DI CECI | INDIVIA SCOTTATA | CRUMBLE DI PEPERONE CRUSCO",
    price: 22,
    order: 1,
    allergens: ["1", "7", "14"],
  },
  {
    idSuffix: "ribs-di-vitello",
    name: "RIBS DI VITELLO",
    description:
      "RIBS DI VITELLO CBT | IL SUO FONDO | CREMOSO DI PATATE ALLE ERBE",
    price: 24,
    order: 2,
    allergens: ["1", "7", "9"],
  },
  {
    idSuffix: "maialino-2-0",
    name: "MAIALINO 2.0",
    description:
      "COPPA DI MAIALINO | CARCIOFO ALLA GIUDIA | PAK CHOI AGRODOLCE | SALSA FOYOT",
    price: 24,
    order: 3,
    allergens: ["1", "7"],
  },
] as const;

const DINNER_DESSERT = [
  {
    idSuffix: "pina-colada",
    name: "PIÑA COLADA",
    description:
      "CREMOSO AL LATTE DI COCCO | CRUMBLE DI COCCO | GELÈ DI ANANAS AL DON PAPA | E CIOCCOLATO BIANCO",
    price: 9,
    order: 0,
    allergens: ["1", "7"],
  },
  {
    idSuffix: "cake-al-cioccolato",
    name: "CAKE AL CIOCCOLATO",
    description:
      "TORTA AL CIOCCOLATO | GANACHE ALLA BANANA | GEL AL VERMOUTH | PLATANO FRITTO",
    price: 9,
    order: 1,
    allergens: ["1", "3", "7"],
  },
  {
    idSuffix: "tiramisu",
    name: "TIRAMISÙ",
    description: "MOUSSE AL MASCARPONE | SAVOIARDO | CAFFE | CACAO",
    price: 9,
    order: 2,
    allergens: ["1", "3", "7"],
  },
  {
    idSuffix: "ricordo-di-una-crostata",
    name: "RICORDO DI UNA CROSTATA",
    description:
      "CRUMBLE DI CIOCCOLATO FONDENTE | CREMOSO ALLO YOGURT E CARDAMOMO | COMPOSTA DI MANGO",
    price: 9,
    order: 3,
    allergens: ["1", "3", "7", "8"],
  },
] as const;

const CATEGORY_BLACK_THEME = {
  backgroundColor: "#000000",
  textColor: "#ffffff",
} as const;

type SeedMenuItem =
  | (typeof DINNER_ANTIPASTI)[number]
  | (typeof DINNER_PRIMI)[number]
  | (typeof DINNER_SECONDI)[number]
  | (typeof DINNER_DESSERT)[number];

async function syncCategoryMenuItems(
  tenantId: string,
  categoryId: string,
  items: readonly SeedMenuItem[]
) {
  const itemIds = items.map((item) => `${categoryId}-${item.idSuffix}`);

  for (const item of items) {
    await prisma.menuItem.upsert({
      where: { id: `${categoryId}-${item.idSuffix}` },
      update: {
        name: item.name,
        description: item.description,
        price: item.price,
        order: item.order,
        allergens: item.allergens,
        visible: true,
      },
      create: {
        id: `${categoryId}-${item.idSuffix}`,
        tenantId,
        categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        order: item.order,
        allergens: item.allergens,
      },
    });
  }

  await prisma.menuItem.deleteMany({
    where: {
      categoryId,
      id: { notIn: itemIds },
    },
  });
}

async function syncCategoryWineItems(
  tenantId: string,
  categoryId: string,
  items: readonly SeedWineItem[]
) {
  const itemIds = items.map((item) => `${categoryId}-${item.idSuffix}`);

  for (const item of items) {
    await prisma.wineItem.upsert({
      where: { id: `${categoryId}-${item.idSuffix}` },
      update: {
        name: item.name,
        producer: item.producer ?? "",
        vintage: item.vintage ?? null,
        region: item.region ?? "",
        subcategory: item.subcategory ?? "",
        description: item.description ?? "",
        glassPrice: item.glassPrice ?? null,
        bottlePrice: item.bottlePrice ?? null,
        order: item.order,
        visible: true,
      },
      create: {
        id: `${categoryId}-${item.idSuffix}`,
        tenantId,
        categoryId,
        name: item.name,
        producer: item.producer ?? "",
        vintage: item.vintage ?? null,
        region: item.region ?? "",
        subcategory: item.subcategory ?? "",
        description: item.description ?? "",
        glassPrice: item.glassPrice ?? null,
        bottlePrice: item.bottlePrice ?? null,
        order: item.order,
      },
    });
  }

  await prisma.wineItem.deleteMany({
    where: {
      categoryId,
      id: { notIn: itemIds },
    },
  });
}

async function syncDinnerAntipasti(
  tenantId: string,
  categoryId: string
) {
  await syncCategoryMenuItems(tenantId, categoryId, DINNER_ANTIPASTI);
}

async function main() {
  console.log("Seeding database...");

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Bistrot",
      slug: "demo",
      subdomain: "demo",
    },
  });

  await prisma.setting.upsert({
    where: { tenantId_key: { tenantId: tenant.id, key: "branding" } },
    update: { value: DEFAULT_BRANDING },
    create: { tenantId: tenant.id, key: "branding", value: DEFAULT_BRANDING },
  });

  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: "admin@demo.it",
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      email: "admin@demo.it",
      name: "Admin Demo",
      passwordHash,
      role: "OWNER",
      tenantId: tenant.id,
    },
  });

  const menus: Array<{
    type: MenuType;
    slug: string;
    name: string;
    layout: MenuLayout;
    subtitle: string;
  }> = [
    {
      type: MenuType.DINNER,
      slug: "dinner",
      name: "Menu Dinner",
      layout: MenuLayout.BISTROT_DINNER,
      subtitle: "A LA CARTE",
    },
    {
      type: MenuType.WINE,
      slug: "wine",
      name: "Menu Wine",
      layout: MenuLayout.BISTROT_WINE,
      subtitle: "LIST",
    },
    {
      type: MenuType.DRINK,
      slug: "drink",
      name: "Menu Drink",
      layout: MenuLayout.BISTROT_DRINK,
      subtitle: "LIST",
    },
  ];

  for (const menuData of menus) {
    const menu = await prisma.menu.upsert({
      where: {
        tenantId_slug: { tenantId: tenant.id, slug: menuData.slug },
      },
      update: {
        name: menuData.name,
        type: menuData.type,
        layout: menuData.layout,
        subtitle: menuData.subtitle,
        allergenLegend: defaultAllergenLegend,
        typography: defaultTypography,
      },
      create: {
        tenantId: tenant.id,
        type: menuData.type,
        slug: menuData.slug,
        name: menuData.name,
        layout: menuData.layout,
        subtitle: menuData.subtitle,
        allergenLegend: defaultAllergenLegend,
        typography: defaultTypography,
        sortOrder: menus.findIndex((m) => m.slug === menuData.slug),
      },
    });

    if (menuData.type === MenuType.DINNER) {
      const antipasti = await prisma.category.upsert({
        where: { id: `${menu.id}-antipasti` },
        update: {},
        create: {
          id: `${menu.id}-antipasti`,
          tenantId: tenant.id,
          menuId: menu.id,
          name: "Antipasti",
          order: 0,
        },
      });

      await syncDinnerAntipasti(tenant.id, antipasti.id);

      const primi = await prisma.category.upsert({
        where: { id: `${menu.id}-primi` },
        update: {},
        create: {
          id: `${menu.id}-primi`,
          tenantId: tenant.id,
          menuId: menu.id,
          name: "Primi",
          order: 1,
        },
      });

      await syncCategoryMenuItems(tenant.id, primi.id, DINNER_PRIMI);

      const secondi = await prisma.category.upsert({
        where: { id: `${menu.id}-secondi` },
        update: {
          name: "Secondi",
          order: 2,
          ...CATEGORY_BLACK_THEME,
        },
        create: {
          id: `${menu.id}-secondi`,
          tenantId: tenant.id,
          menuId: menu.id,
          name: "Secondi",
          order: 2,
          ...CATEGORY_BLACK_THEME,
        },
      });

      await syncCategoryMenuItems(tenant.id, secondi.id, DINNER_SECONDI);

      const dessert = await prisma.category.upsert({
        where: { id: `${menu.id}-dessert` },
        update: {
          name: "Dessert",
          order: 3,
        },
        create: {
          id: `${menu.id}-dessert`,
          tenantId: tenant.id,
          menuId: menu.id,
          name: "Dessert",
          order: 3,
        },
      });

      await syncCategoryMenuItems(tenant.id, dessert.id, DINNER_DESSERT);

      const currentMenu = await prisma.menu.findUnique({
        where: { id: menu.id },
        select: { intro: true, coverVideoUrl: true },
      });

      await prisma.menu.update({
        where: { id: menu.id },
        data: {
          coverVideoUrl:
            currentMenu?.coverVideoUrl ??
            `/uploads/${tenant.id}/${menu.id}/cover-video.mp4`,
          intro: mergeIntro(
            currentMenu?.intro,
            buildDinnerIntro(tenant.id, menu.id)
          ),
        },
      });
    }

    if (menuData.type === MenuType.WINE) {
      const wineCoverPath = `/uploads/${tenant.id}/${menu.id}/cover-image.jpg`;
      const dinnerMenu = await prisma.menu.findFirst({
        where: { tenantId: tenant.id, type: MenuType.DINNER },
        select: { id: true },
      });
      const dinnerLogoPath = dinnerMenu
        ? `/uploads/${tenant.id}/${dinnerMenu.id}/intro-logo.png`
        : null;

      const currentWineMenu = await prisma.menu.findUnique({
        where: { id: menu.id },
        select: { intro: true },
      });

      await prisma.menu.update({
        where: { id: menu.id },
        data: {
          coverImageUrl: wineCoverPath,
          subtitle: "LIST",
          intro: mergeIntro(currentWineMenu?.intro, {
            logoUrl: dinnerLogoPath,
            heroTitle: "WINE",
            address: DEFAULT_BRANDING.address,
          }),
        },
      });

      for (const categoryData of WINE_CATEGORIES) {
        const category = await prisma.category.upsert({
          where: { id: `${menu.id}-${categoryData.idSuffix}` },
          update: {
            name: categoryData.name,
            order: categoryData.order,
          },
          create: {
            id: `${menu.id}-${categoryData.idSuffix}`,
            tenantId: tenant.id,
            menuId: menu.id,
            name: categoryData.name,
            order: categoryData.order,
          },
        });

        await syncCategoryWineItems(
          tenant.id,
          category.id,
          categoryData.items
        );
      }

      await prisma.category.deleteMany({
        where: {
          menuId: menu.id,
          id: {
            notIn: WINE_CATEGORIES.map(
              (category) => `${menu.id}-${category.idSuffix}`
            ),
          },
        },
      });
    }

    if (menuData.type === MenuType.DRINK) {
      const cocktail = await prisma.category.upsert({
        where: { id: `${menu.id}-cocktail` },
        update: {},
        create: {
          id: `${menu.id}-cocktail`,
          tenantId: tenant.id,
          menuId: menu.id,
          name: "Cocktail",
          order: 0,
        },
      });

      await prisma.drinkItem.createMany({
        data: [
          {
            tenantId: tenant.id,
            categoryId: cocktail.id,
            name: "Negroni",
            ingredients: "Gin, Campari, Vermouth rosso",
            description: "Classico cocktail italiano",
            price: 12,
            order: 0,
          },
          {
            tenantId: tenant.id,
            categoryId: cocktail.id,
            name: "Spritz",
            ingredients: "Aperol, Prosecco, Soda",
            price: 10,
            order: 1,
          },
        ],
        skipDuplicates: true,
      });
    }
  }

  console.log("Seed completed!");
  console.log(`  Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`  User: ${user.email} / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
