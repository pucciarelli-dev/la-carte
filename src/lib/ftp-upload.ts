import { joinFtpPath } from "@/lib/ftp-publish-path";
import type { FtpPublishSettings } from "@/lib/ftp-settings";
import type { StaticMenuFile } from "@/lib/generate-static-menu";
import { Client } from "basic-ftp";
import { Readable } from "stream";

export async function uploadStaticMenuViaFtp(input: {
  ftp: FtpPublishSettings;
  publishPath: string;
  files: StaticMenuFile[];
}) {
  const client = new Client(60_000);
  client.ftp.verbose = false;

  try {
    await client.access({
      host: input.ftp.host,
      port: input.ftp.port || 21,
      user: input.ftp.user,
      password: input.ftp.password,
      // Aruba: FTP esplicito su TLS
      secure: input.ftp.secure,
      secureOptions: input.ftp.secure
        ? { rejectUnauthorized: false }
        : undefined,
    });

    const remoteDir = `/${joinFtpPath(
      input.ftp.remoteBasePath,
      input.publishPath
    )}`;

    await client.ensureDir(remoteDir);
    await client.cd(remoteDir);

    for (const file of input.files) {
      const stream = Readable.from(file.content);
      await client.uploadFrom(stream, file.remotePath);
    }

    return { remoteDir };
  } finally {
    client.close();
  }
}
