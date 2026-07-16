import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const OUT_DIR = path.join(process.cwd(), "tmp");
const OUT_FILE = path.join(OUT_DIR, "local-db-export.json");

function serialize(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Prisma.Decimal) return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        serialize(v),
      ])
    );
  }
  return value;
}

async function main() {
  const data = {
    exportedAt: new Date().toISOString(),
    tenants: await prisma.tenant.findMany(),
    users: await prisma.user.findMany(),
    accounts: await prisma.account.findMany(),
    sessions: await prisma.session.findMany(),
    verificationTokens: await prisma.verificationToken.findMany(),
    menus: await prisma.menu.findMany(),
    categories: await prisma.category.findMany(),
    menuItems: await prisma.menuItem.findMany(),
    wineItems: await prisma.wineItem.findMany(),
    drinkItems: await prisma.drinkItem.findMany(),
    menuVersions: await prisma.menuVersion.findMany(),
    settings: await prisma.setting.findMany(),
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(serialize(data), null, 2), "utf8");

  console.log(`Exported to ${OUT_FILE}`);
  console.log(
    [
      `tenants=${data.tenants.length}`,
      `users=${data.users.length}`,
      `menus=${data.menus.length}`,
      `categories=${data.categories.length}`,
      `menuItems=${data.menuItems.length}`,
      `wineItems=${data.wineItems.length}`,
      `drinkItems=${data.drinkItems.length}`,
      `menuVersions=${data.menuVersions.length}`,
      `settings=${data.settings.length}`,
    ].join(" | ")
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
