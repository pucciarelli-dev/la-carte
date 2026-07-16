export type MenuCoverKind = "image" | "video";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const VIDEO_EXTENSIONS: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export const MENU_COVER_LIMITS = {
  imageBytes: 5 * 1024 * 1024,
  videoBytes: 25 * 1024 * 1024,
} as const;

export function getCoverExtension(
  kind: MenuCoverKind,
  mimeType: string
): string | null {
  if (kind === "image") return IMAGE_EXTENSIONS[mimeType] ?? null;
  return VIDEO_EXTENSIONS[mimeType] ?? null;
}

export function isAllowedCoverMime(
  kind: MenuCoverKind,
  mimeType: string
): boolean {
  if (kind === "image") return IMAGE_MIME_TYPES.has(mimeType);
  return VIDEO_MIME_TYPES.has(mimeType);
}

export function getCoverFilename(kind: MenuCoverKind, mimeType: string): string {
  const ext = getCoverExtension(kind, mimeType);
  if (!ext) {
    throw new Error("Formato file non supportato");
  }
  return kind === "image" ? `cover-image.${ext}` : `cover-video.${ext}`;
}
