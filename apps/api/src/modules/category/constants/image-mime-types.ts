export const CATEGORY_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type CategoryImageMimeType = (typeof CATEGORY_IMAGE_MIME_TYPES)[number];