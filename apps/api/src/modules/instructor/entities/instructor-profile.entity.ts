import { InstructorApplicationStatus, InstructorProfileStatus, MediaType, OfferingStatus, } from '@prisma/client';

export class OfferingMediaEntity {
    id!: string;
    offeringId!: string;
    type!: MediaType;
    storageKey!: string;
    url!: string;
    mimeType!: string;
    sizeBytes!: number;
    sortOrder!: number;
    createdAt!: Date;
}

export class InstructorOfferingEntity {
    id!: string;
    profileId!: string;
    applicationId?: string | null;
    subcategoryId!: string;
    title?: string | null;
    description?: string | null;
    hourlyRate!: string;
    currency!: string;
    experienceYears?: number | null;
    status!: OfferingStatus;
    reviewNote?: string | null;
    reviewedAt?: Date | null;
    reviewedBy?: string | null;
    createdAt!: Date;
    updatedAt!: Date;

    subcategory!: {
        id: string;
        name: string;
        slug: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
    };

    media!: OfferingMediaEntity[];
}

export class InstructorApplicationEntity {
    id!: string;
    profileId!: string;
    status!: InstructorApplicationStatus;
    submittedAt!: Date;
    reviewedAt?: Date | null;
    reviewedBy?: string | null;
    reviewNote?: string | null;
    createdAt!: Date;
    updatedAt!: Date;
    offerings!: InstructorOfferingEntity[];

    profile?: {
        id: string;
        bio?: string | null;
        location?: string | null;
        portfolioUrl:string | null;
        status: InstructorProfileStatus;
        user: {
            id: string;
            name: string;
            email: string;
            imageUrl?: string | null;
            roles: string[];
        };
    };
}

export class InstructorProfileEntity {
    id!: string;
    userId!: string;
    bio?: string | null;
    location?: string | null;
    portfolioUrl?: string | null;
    status!: InstructorProfileStatus;
    createdAt!: Date;
    updatedAt!: Date;
    offerings!: InstructorOfferingEntity[];
    latestApplication?: InstructorApplicationEntity | null;
}