export const CATEGORY_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type CategoryImageMimeType = (typeof CATEGORY_IMAGE_MIME_TYPES)[number];

export const CATEGORY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const CATEGORY_IMAGE_KEY_PREFIX = 'categories';
export const SUBCATEGORY_IMAGE_KEY_PREFIX = 'subcategories';