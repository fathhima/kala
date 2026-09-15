export const OFFERING_MEDIA_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm',] as const;

export type OfferingMediaMimeType = (typeof OFFERING_MEDIA_MIME_TYPES)[number];