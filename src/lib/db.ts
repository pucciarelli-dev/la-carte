import { createHash } from "crypto";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaClientHash: string | undefined;
};

function getPrismaSchemaHash(): string {
  try {
    const schema = readFileSync(
      path.join(process.cwd(), "prisma/schema.prisma"),
      "utf8"
    );
    return createHash("md5").update(schema).digest("hex").slice(0, 12);
  } catch {
    return "unknown";
  }
}

function getPrismaClientHash(): string {
  const schemaHash = getPrismaSchemaHash();
  const clientPaths = [
    path.join(process.cwd(), "node_modules/.prisma/client/index.js"),
    path.join(process.cwd(), "node_modules/.prisma/client/schema.prisma"),
  ];

  try {
    const clientHash = clientPaths
      .filter((clientPath) => existsSync(clientPath))
      .map((clientPath) =>
        createHash("md5").update(readFileSync(clientPath, "utf8")).digest("hex")
      )
      .join("-");
    return `${schemaHash}-${clientHash}`;
  } catch {
    return schemaHash;
  }
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrismaClient(): PrismaClient {
  const clientHash = getPrismaClientHash();

  if (
    globalForPrisma.prisma &&
    globalForPrisma.prismaClientHash === clientHash
  ) {
    return globalForPrisma.prisma;
  }

  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaClientHash = clientHash;
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
