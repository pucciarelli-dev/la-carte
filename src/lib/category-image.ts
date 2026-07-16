const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const CATEGORY_IMAGE_LIMITS = {
  imageBytes: 5 * 1024 * 1024,
} as const;

export function isAllowedCategoryImageMime(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.has(mimeType);
}

export function getCategoryImageFilename(mimeType: string): string {
  const ext = IMAGE_EXTENSIONS[mimeType];
  if (!ext) {
    throw new Error("Formato file non supportato");
  }
  return `footer.${ext}`;
}
