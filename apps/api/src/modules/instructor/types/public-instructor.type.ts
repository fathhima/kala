import { MediaType } from "../enums/instructor.enum";

export type PublicInstructorMedia = {
    id: string;
    type: MediaType;
    storageKey: string;
};

export type PublicInstructorMediaView = {
    id: string;
    type: MediaType;
    viewUrl: string;
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

export type PublicInstructorResponse = Omit<PublicInstructorProfile, 'offerings'> & {
    offerings: Array<Omit<PublicInstructorOffering, 'media'> & {
        media: PublicInstructorMediaView[];
    }
    >;
};