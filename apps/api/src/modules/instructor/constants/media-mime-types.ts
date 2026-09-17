export const OFFERING_MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm',] as const;

export type OfferingMediaMimeType = (typeof OFFERING_MEDIA_MIME_TYPES)[number];

export const OFFERING_IMAGE_MAX_COUNT = 10;
export const OFFERING_VIDEO_MAX_COUNT = 3;
export const OFFERING_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const OFFERING_VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const OFFERING_MEDIA_KEY_PREFIX = 'instructor-offerings';