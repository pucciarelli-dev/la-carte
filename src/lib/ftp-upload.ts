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
    .filter(Boolean);
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

/** Create missing segments from current cwd; leave cwd at the target base. */
async function ensureRelativePath(client: Client, segments: string[]) {
  for (const part of segments) {
    const entries = await client.list();
    const exists = entries.some(
      (entry) => entry.name === part && entry.isDirectory
    );
    if (!exists) {
      await client.send(`MKD ${part}`);
    }
    await client.cd(part);
  }
}

async function dirExistsInCwd(client: Client, name: string): Promise<boolean> {
  try {
    const entries = await client.list();
    return entries.some((entry) => entry.name === name && entry.isDirectory);
  } catch {
    return false;
  }
}

async function removeDirInCwd(client: Client, name: string) {
  if (await dirExistsInCwd(client, name)) {
    await client.removeDir(name);
  }
}

/**
 * Upload to a staging folder, then swap into place so a failed publish
 * never partially overwrites the live menu directory.
 */
export async function uploadStaticMenuViaFtp(input: {
  ftp: FtpPublishSettings;
  publishPath: string;
  files: StaticMenuFile[];
}) {
  const client = new Client(60_000);
  client.ftp.verbose = false;

  const basePath = joinFtpPath(
    input.ftp.remoteBasePath === "." ? "" : input.ftp.remoteBasePath
  );
  const liveName = joinFtpPath(input.publishPath);
  if (liveName.includes("/")) {
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

    const homePwd = await client.pwd();
    const segments = remainingBaseSegments(homePwd, basePath);
    await ensureRelativePath(client, segments);

    const basePwd = normalizeFtpPwd(await client.pwd());

    await removeDirInCwd(client, incomingName);
    await client.send(`MKD ${incomingName}`);
    await client.cd(incomingName);

    for (const file of input.files) {
      const stream = Readable.from(file.content);
      await client.uploadFrom(stream, file.remotePath);
    }

    await client.cd(".."); // back to base

    await removeDirInCwd(client, previousName);

    const liveExists = await dirExistsInCwd(client, liveName);
    if (liveExists) {
      await client.rename(liveName, previousName);
    }

    try {
      await client.rename(incomingName, liveName);
    } catch (error) {
      if (liveExists) {
        try {
          await client.rename(previousName, liveName);
        } catch {
          // ignore secondary failure
        }
      }
      throw error;
    }

    await removeDirInCwd(client, previousName);

    // Confirm live folder exists and report the real FTP path
    if (!(await dirExistsInCwd(client, liveName))) {
      throw new Error(
        `Upload completato ma la cartella "${liveName}" non risulta in ${basePwd}`
      );
    }

    await client.cd(liveName);
    const remoteDir = normalizeFtpPwd(await client.pwd());
    const listing = (await client.list()).map((entry) => entry.name);

    return {
      remoteDir,
      baseDir: basePwd,
      files: listing,
    };
  } finally {
    client.close();
  }
}
