import { spawn } from "child_process";
import { createConnection } from "net";
import { existsSync, unlinkSync, rmSync } from "fs";
import path from "path";
import EmbeddedPostgres from "embedded-postgres";

const DB_DIR = path.join(process.cwd(), ".pgdata");
const PORT = 5432;
const DATABASE_URL =
  "postgresql://postgres:password@localhost:5432/carte?schema=public";

function assertNodeVersion() {
  const major = Number(process.versions.node.split(".")[0] ?? "0");
  if (Number.isNaN(major) || major < 20) {
    throw new Error(
      `Node ${process.versions.node} non supportato. Usa nvm: \`nvm use\` (richiesto Node 20+).`
    );
  }
}

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

function removeStalePostgresLock() {
  const pidFile = path.join(DB_DIR, "postmaster.pid");
  if (existsSync(pidFile)) {
    unlinkSync(pidFile);
  }
}

async function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL },
      shell: true,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });
  });
}

async function main() {
  assertNodeVersion();
  console.log("🐘 Avvio PostgreSQL embedded...");

  const pg = new EmbeddedPostgres({
    databaseDir: DB_DIR,
    user: "postgres",
    password: "password",
    port: PORT,
    persistent: true,
  });

  const postgresAlreadyRunning = await isPortOpen(PORT);

  if (!postgresAlreadyRunning) {
    if (!existsSync(DB_DIR)) {
      await pg.initialise();
    } else {
      removeStalePostgresLock();
    }

    await pg.start();
  } else {
    console.log("   PostgreSQL già in esecuzione sulla porta 5432");
  }

  try {
    await pg.createDatabase("carte");
  } catch {
    // database may already exist
  }

  process.env.DATABASE_URL = DATABASE_URL;

  console.log("📦 Sincronizzazione schema...");
  await run("npx", ["prisma", "db", "push"]);
  await run("npx", ["prisma", "generate"]);

  const nextCacheDir = path.join(process.cwd(), ".next");
  if (existsSync(nextCacheDir)) {
    console.log("🧹 Pulizia cache Next.js (client Prisma aggiornato)...");
    rmSync(nextCacheDir, { recursive: true, force: true });
  }

  console.log("🌱 Seed dati demo...");
  await run("npx", ["tsx", "prisma/seed.ts"]);

  console.log("\n✅ Database pronto");
  console.log("   Email:    admin@demo.it");
  console.log("   Password: password123\n");
  console.log("🚀 Avvio Next.js su http://localhost:3000\n");

  const next = spawn("npx", ["next", "dev"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL },
    shell: true,
  });

  const shutdown = async () => {
    console.log("\n🛑 Arresto in corso...");
    next.kill("SIGTERM");
    await pg.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  next.on("exit", async (code) => {
    await pg.stop();
    process.exit(code ?? 0);
  });
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
