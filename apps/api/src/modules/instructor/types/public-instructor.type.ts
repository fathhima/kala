import { MediaType } from '@prisma/client';

export type PublicInstructorMedia = {
    id: string;
    type: MediaType;
    storageKey: string;
};

export type PublicInstructorOffering = {
    id: string;
    title: string | null;
    description: string | null;
    hourlyRate: string;
    currency: string;
    experienceYears: number | null;
    subcategory: {
        id: string;
        name: string;
        slug: string;
        category: {
            id: string;
            name: string;
            slug: string;
        };
    };
    media: PublicInstructorMedia[];
};

export type PublicInstructorProfile = {
    id: string;
    name: string;
    imageUrl: string | null;
    bio: string | null;
    location: string | null;
    portfolioUrl: string | null;
    offerings: PublicInstructorOffering[];
};