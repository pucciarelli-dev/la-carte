import { prisma } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/secret-crypto";

export const FTP_SETTINGS_KEY = "ftpPublish";

export type FtpPublishSettings = {
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
  remoteBasePath: string;
  publicBaseUrl: string;
};

export type FtpPublishSettingsPublic = Omit<FtpPublishSettings, "password"> & {
  hasPassword: boolean;
};

const DEFAULTS: FtpPublishSettings = {
  host: "",
  port: 21,
  user: "",
  password: "",
  secure: true,
  remoteBasePath: "/bistrot.southgarage.com",
  publicBaseUrl: "https://bistrot.southgarage.com",
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function parseFtpSettings(value: unknown): FtpPublishSettings {
  if (!value || typeof value !== "object") return { ...DEFAULTS };

  const raw = value as Record<string, unknown>;
  return {
    host: asString(raw.host).trim(),
    port: asNumber(raw.port, 21),
    user: asString(raw.user).trim(),
    password: asString(raw.password),
    secure: asBoolean(raw.secure, true),
    remoteBasePath: asString(raw.remoteBasePath, DEFAULTS.remoteBasePath).trim(),
    publicBaseUrl: asString(raw.publicBaseUrl, DEFAULTS.publicBaseUrl).trim(),
  };
}

export async function getFtpPublishSettings(
  tenantId: string
): Promise<FtpPublishSettings> {
  const setting = await prisma.setting.findUnique({
    where: { tenantId_key: { tenantId, key: FTP_SETTINGS_KEY } },
  });

  const parsed = parseFtpSettings(setting?.value);
  if (!parsed.password) return parsed;

  try {
    return {
      ...parsed,
      password: decryptSecret(parsed.password),
    };
  } catch {
    return { ...parsed, password: "" };
  }
}

export async function getFtpPublishSettingsPublic(
  tenantId: string
): Promise<FtpPublishSettingsPublic> {
  const setting = await prisma.setting.findUnique({
    where: { tenantId_key: { tenantId, key: FTP_SETTINGS_KEY } },
  });
  const parsed = parseFtpSettings(setting?.value);
  return {
    host: parsed.host,
    port: parsed.port,
    user: parsed.user,
    secure: parsed.secure,
    remoteBasePath: parsed.remoteBasePath,
    publicBaseUrl: parsed.publicBaseUrl,
    hasPassword: Boolean(parsed.password),
  };
}

export async function updateFtpPublishSettings(
  tenantId: string,
  input: Partial<FtpPublishSettings> & { password?: string }
) {
  const current = await getFtpPublishSettings(tenantId);
  const nextPassword =
    input.password && input.password.trim().length > 0
      ? encryptSecret(input.password.trim())
      : current.password
        ? encryptSecret(current.password)
        : "";

  const next: FtpPublishSettings = {
    host: (input.host ?? current.host).trim(),
    port: input.port ?? current.port,
    user: (input.user ?? current.user).trim(),
    password: nextPassword,
    secure: input.secure ?? current.secure,
    remoteBasePath: (input.remoteBasePath ?? current.remoteBasePath).trim(),
    publicBaseUrl: (input.publicBaseUrl ?? current.publicBaseUrl).trim(),
  };

  await prisma.setting.upsert({
    where: { tenantId_key: { tenantId, key: FTP_SETTINGS_KEY } },
    update: { value: next },
    create: { tenantId, key: FTP_SETTINGS_KEY, value: next },
  });

  return getFtpPublishSettingsPublic(tenantId);
}

export function isFtpConfigured(settings: FtpPublishSettings): boolean {
  return Boolean(
    settings.host &&
      settings.user &&
      settings.password &&
      settings.publicBaseUrl
  );
}
