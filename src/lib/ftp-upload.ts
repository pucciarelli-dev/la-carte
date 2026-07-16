import { Client } from "basic-ftp";
import { Readable } from "stream";
import { joinFtpPath } from "@/lib/ftp-publish-path";
import type { FtpPublishSettings } from "@/lib/ftp-settings";
import type { StaticMenuFile } from "@/lib/generate-static-menu";

async function dirExists(client: Client, absolutePath: string): Promise<boolean> {
  try {
    const list = await client.list(absolutePath);
    return Array.isArray(list);
  } catch {
    return false;
  }
}

async function removeDirIfExists(client: Client, absolutePath: string) {
  if (await dirExists(client, absolutePath)) {
    await client.removeDir(absolutePath);
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

  const base = `/${joinFtpPath(input.ftp.remoteBasePath)}`;
  const liveName = joinFtpPath(input.publishPath);
  const incomingName = `${liveName}__incoming`;
  const previousName = `${liveName}__previous`;

  const liveDir = `/${joinFtpPath(input.ftp.remoteBasePath, liveName)}`;
  const incomingDir = `/${joinFtpPath(input.ftp.remoteBasePath, incomingName)}`;
  const previousDir = `/${joinFtpPath(input.ftp.remoteBasePath, previousName)}`;

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

    await removeDirIfExists(client, incomingDir);
    await client.ensureDir(incomingDir);

    for (const file of input.files) {
      const stream = Readable.from(file.content);
      await client.uploadFrom(stream, `${incomingDir}/${file.remotePath}`);
    }

    await client.cd(base);
    await removeDirIfExists(client, previousDir);

    const liveExists = await dirExists(client, liveDir);
    await client.cd(base);

    if (liveExists) {
      await client.rename(liveName, previousName);
    }

    try {
      await client.rename(incomingName, liveName);
    } catch (error) {
      if (liveExists) {
        try {
          await client.cd(base);
          await client.rename(previousName, liveName);
        } catch {
          // ignore secondary failure
        }
      }
      throw error;
    }

    await removeDirIfExists(client, previousDir);

    return { remoteDir: liveDir };
  } finally {
    client.close();
  }
}
