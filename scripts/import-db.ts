import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const IN_FILE =
  process.argv[2] ?? path.join(process.cwd(), "tmp", "local-db-export.json");

type ExportPayload = {
  tenants: Record<string, unknown>[];
  users: Record<string, unknown>[];
  accounts: Record<string, unknown>[];
  sessions: Record<string, unknown>[];
  verificationTokens: Record<string, unknown>[];
  menus: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  menuItems: Record<string, unknown>[];
  wineItems: Record<string, unknown>[];
  drinkItems: Record<string, unknown>[];
  menuVersions: Record<string, unknown>[];
  settings: Record<string, unknown>[];
};

async function clearAll() {
  await prisma.menu.updateMany({ data: { publishedVersionId: null } });
  await prisma.menuVersion.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.wineItem.deleteMany();
  await prisma.drinkItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  const payload = JSON.parse(readFileSync(IN_FILE, "utf8")) as ExportPayload;
  console.log(`Importing from ${IN_FILE}`);
  console.log(`Target DB: ${process.env.DATABASE_URL.replace(/:[^:@/]+@/, ":***@")}`);

  await clearAll();

  if (payload.tenants.length) {
    await prisma.tenant.createMany({ data: payload.tenants as never });
  }
  if (payload.users.length) {
    await prisma.user.createMany({ data: payload.users as never });
  }
  if (payload.accounts.length) {
    await prisma.account.createMany({ data: payload.accounts as never });
  }
  if (payload.sessions.length) {
    await prisma.session.createMany({ data: payload.sessions as never });
  }
  if (payload.verificationTokens.length) {
    await prisma.verificationToken.createMany({
      data: payload.verificationTokens as never,
    });
  }

  // Menus first without publishedVersionId (circular FK with MenuVersion)
  const menusWithoutPublished = payload.menus.map((menu) => ({
    ...menu,
    publishedVersionId: null,
  }));
  if (menusWithoutPublished.length) {
    await prisma.menu.createMany({ data: menusWithoutPublished as never });
  }

  if (payload.categories.length) {
    await prisma.category.createMany({ data: payload.categories as never });
  }
  if (payload.menuItems.length) {
    await prisma.menuItem.createMany({ data: payload.menuItems as never });
  }
  if (payload.wineItems.length) {
    await prisma.wineItem.createMany({ data: payload.wineItems as never });
  }
  if (payload.drinkItems.length) {
    await prisma.drinkItem.createMany({ data: payload.drinkItems as never });
  }
  if (payload.menuVersions.length) {
    await prisma.menuVersion.createMany({
      data: payload.menuVersions as never,
    });
  }

  for (const menu of payload.menus) {
    if (!menu.publishedVersionId) continue;
    await prisma.menu.update({
      where: { id: menu.id as string },
      data: { publishedVersionId: menu.publishedVersionId as string },
    });
  }

  if (payload.settings.length) {
    await prisma.setting.createMany({ data: payload.settings as never });
  }

  console.log("Import completed.");
  console.log(
    [
      `tenants=${payload.tenants.length}`,
      `users=${payload.users.length}`,
      `menus=${payload.menus.length}`,
      `categories=${payload.categories.length}`,
      `menuItems=${payload.menuItems.length}`,
      `wineItems=${payload.wineItems.length}`,
      `drinkItems=${payload.drinkItems.length}`,
      `menuVersions=${payload.menuVersions.length}`,
      `settings=${payload.settings.length}`,
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
