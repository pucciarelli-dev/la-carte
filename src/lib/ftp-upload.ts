import { Client } from "basic-ftp";
import { Readable } from "stream";
import { joinFtpPath } from "@/lib/ftp-publish-path";
import type { FtpPublishSettings } from "@/lib/ftp-settings";
import type { StaticMenuFile } from "@/lib/generate-static-menu";

function normalizeFtpPwd(pwd: string) {
  return pwd.replace(/\\/g, "/").replace(/\/+$/, "") || "/";
}

/**
 * If FTP login already lands inside (part of) remoteBasePath, don't recreate
 * those segments — otherwise Aruba ends up with a nested duplicate folder.
 */
function remainingBaseSegments(pwd: string, remoteBasePath: string): string[] {
  const parts = remoteBasePath
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== ".");
  if (parts.length === 0) return [];

  const pwdParts = normalizeFtpPwd(pwd).split("/").filter(Boolean);

  for (let len = Math.min(parts.length, pwdParts.length); len > 0; len--) {
    const prefix = parts.slice(0, len);
    const suffix = pwdParts.slice(-len);
    if (prefix.every((part, index) => part === suffix[index])) {
      return parts.slice(len);
    }
  }

  return parts;
}

async function listNames(client: Client): Promise<string[]> {
  try {
    return (await client.list()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

/** True if we can CD into `name` from cwd (more reliable than LIST+isDirectory on Aruba). */
async function childDirExists(client: Client, name: string): Promise<boolean> {
  try {
    await client.cd(name);
    await client.cdup();
    return true;
  } catch {
    return false;
  }
}

/**
 * Create `name` under cwd if missing, then CD into it.
 * Uses CD probe + MKD + ensureDir — Aruba often lies about directory listings
 * after folders were deleted from the file manager.
 */
async function ensureChildDirAndEnter(client: Client, name: string) {
  if (await childDirExists(client, name)) {
    await client.cd(name);
    return;
  }

  try {
    await client.send(`MKD ${name}`);
  } catch {
    // May already exist, or LIST was stale — try enter / ensureDir below.
  }

  try {
    await client.cd(name);
    return;
  } catch {
    // continue
  }

  try {
    // basic-ftp: create path relative to cwd and leave cwd at target
    await client.ensureDir(name);
    return;
  } catch {
    // continue to final probe
  }

  try {
    await client.cd(name);
    return;
  } catch {
    const pwd = normalizeFtpPwd(await client.pwd());
    const names = await listNames(client);
    throw new Error(
      `Impossibile creare/entrare nella cartella "${name}" in ${pwd}. Contenuto: [${names.join(", ") || "vuoto"}]`
    );
  }
}

/** Create missing segments from current cwd; leave cwd at the target base. */
async function ensureRelativePath(client: Client, segments: string[]) {
  for (const part of segments) {
    await ensureChildDirAndEnter(client, part);
  }
}

async function removeDirInCwd(client: Client, name: string) {
  if (!(await childDirExists(client, name))) return;
  try {
    await client.removeDir(name);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "removeDir failed";
    throw new Error(`Impossibile rimuovere "${name}": ${detail}`);
  }
}

async function uploadFilesInCwd(client: Client, files: StaticMenuFile[]) {
  for (const file of files) {
    const stream = Readable.from(file.content);
    await client.uploadFrom(stream, file.remotePath);
  }
}

async function goToBase(
  client: Client,
  ftp: FtpPublishSettings
): Promise<string> {
  const basePath = joinFtpPath(
    ftp.remoteBasePath === "." ? "" : ftp.remoteBasePath
  );
  const homePwd = await client.pwd();
  const segments = remainingBaseSegments(homePwd, basePath);
  await ensureRelativePath(client, segments);
  return normalizeFtpPwd(await client.pwd());
}

async function uploadFresh(
  client: Client,
  liveName: string,
  files: StaticMenuFile[]
) {
  await ensureChildDirAndEnter(client, liveName);
  await uploadFilesInCwd(client, files);
}

async function uploadWithSwap(
  client: Client,
  liveName: string,
  incomingName: string,
  previousName: string,
  files: StaticMenuFile[]
) {
  await ensureChildDirAndEnter(client, incomingName);
  await uploadFilesInCwd(client, files);
  await client.cdup();

  try {
    await client.rename(liveName, previousName);
  } catch {
    // Live vanished between check and rename (manual delete) — treat as fresh.
    await client.rename(incomingName, liveName);
    await client.cd(liveName);
    return;
  }

  try {
    await client.rename(incomingName, liveName);
  } catch (error) {
    try {
      await client.rename(previousName, liveName);
    } catch {
      // ignore secondary failure
    }
    throw error;
  }

  await removeDirInCwd(client, previousName);
  await client.cd(liveName);
}

/**
 * Upload menu files via FTP. Recreates missing folders.
 * If the live folder already exists, uses a staging swap so a failed
 * publish never leaves a half-written live directory.
 */
export async function uploadStaticMenuViaFtp(input: {
  ftp: FtpPublishSettings;
  publishPath: string;
  files: StaticMenuFile[];
}) {
  const client = new Client(60_000);
  client.ftp.verbose = false;

  const liveName = joinFtpPath(input.publishPath);
  if (!liveName || liveName.includes("/")) {
    throw new Error(
      "Il percorso menu non può contenere sottocartelle (usa solo es. menu-dinner)."
    );
  }
  const incomingName = `${liveName}__incoming`;
  const previousName = `${liveName}__previous`;

  try {
    await client.access({
      host: input.ftp.host,
      port: input.ftp.port || 21,
      user: input.ftp.user,
      password: input.ftp.password,
      secure: input.ftp.secure,
      secureOptions: input.ftp.secure
        ? { rejectUnauthorized: false }
        : undefined,
    });

    const basePwd = await goToBase(client, input.ftp);

    // Cleanup leftovers from interrupted publishes
    await removeDirInCwd(client, incomingName);
    await removeDirInCwd(client, previousName);

    const liveExists = await childDirExists(client, liveName);

    if (!liveExists) {
      await uploadFresh(client, liveName, input.files);
    } else {
      try {
        await uploadWithSwap(
          client,
          liveName,
          incomingName,
          previousName,
          input.files
        );
      } catch (error) {
        // Last resort: recreate live folder from scratch
        await removeDirInCwd(client, incomingName);
        await removeDirInCwd(client, previousName);
        if (await childDirExists(client, liveName)) {
          throw error;
        }
        await uploadFresh(client, liveName, input.files);
      }
    }

    const remoteDir = normalizeFtpPwd(await client.pwd());
    const listing = await listNames(client);
    const required = input.files.map((file) => file.remotePath);
    const missing = required.filter((name) => !listing.includes(name));
    // .htaccess may be hidden from LIST on some hosts — only require HTML files
    const requiredVisible = required.filter((name) => !name.startsWith("."));
    const missingVisible = requiredVisible.filter(
      (name) => !listing.includes(name)
    );
    if (missingVisible.length > 0) {
      throw new Error(
        `Cartella ${remoteDir} creata ma file mancanti: ${missingVisible.join(", ")}. Elenco: [${listing.join(", ") || "vuoto"}]`
      );
    }

    return {
      remoteDir,
      baseDir: basePwd,
      files: listing,
      missingHidden: missing.filter((name) => name.startsWith(".")),
    };
  } finally {
    client.close();
  }
}
