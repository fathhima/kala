import { CategoryImageMimeType } from '../constants/image-mime-types';

export type RequestCategoryImageUploadInput = {
    mimeType: CategoryImageMimeType;
    sizeBytes: number;
};

export type ConfirmCategoryImageUploadInput = {
    storageKey: string;
};