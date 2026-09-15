import { MediaType } from '../enums/instructor.enum';

export type PublicInstructorQueryInput = {
    page?: number;
    limit?: number;
    search?: string;
    subcategoryId?: string;
};

export type UpdateInstructorProfileInput = {
    bio?: string;
    location?: string;
    portfolioUrl?: string;
};

export type CreateOfferingInput = {
    subcategoryId: string;
    title?: string;
    description?: string;
    hourlyRate: number;
    currency?: string;
    experienceYears?: number;
};

export type UpdateOfferingInput = Partial<CreateOfferingInput>;

export type RequestOfferingMediaUploadInput = {
    type: MediaType;
    mimeType: string;
    sizeBytes: number;
    sortOrder: number;
};

export type ConfirmOfferingMediaUploadInput = {
    type: MediaType;
    storageKey: string;
    sortOrder: number;
};