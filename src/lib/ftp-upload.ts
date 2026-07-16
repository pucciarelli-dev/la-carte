import { Client } from "basic-ftp";
import { Readable } from "stream";
import { joinFtpPath } from "@/lib/ftp-publish-path";
import type { FtpPublishSettings } from "@/lib/ftp-settings";
import type { StaticMenuFile } from "@/lib/generate-static-menu";

/**
 * Create each path segment from the FTP home / root, then leave cwd there.
 * Absolute ensureDir is unreliable on some hosts (e.g. Aruba).
 */
async function ensurePathFromRoot(client: Client, absoluteOrRelative: string) {
  const parts = absoluteOrRelative
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  // Prefer account root; ignore failure if the host is already chrooted.
  try {
    await client.cd("/");
  } catch {
    // stay where login left us
  }

  for (const part of parts) {
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

  const basePath = joinFtpPath(input.ftp.remoteBasePath);
  const liveName = joinFtpPath(input.publishPath);
  const incomingName = `${liveName}__incoming`;
  const previousName = `${liveName}__previous`;
  const liveDir = `/${joinFtpPath(basePath, liveName)}`;

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

    // Create remoteBasePath if missing (e.g. bistrot.southgarage.com)
    await ensurePathFromRoot(client, basePath);

    // cwd = base
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

    return { remoteDir: liveDir };
  } finally {
    client.close();
  }
}
