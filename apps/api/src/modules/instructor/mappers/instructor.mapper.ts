import { InstructorApplication, InstructorOffering, InstructorProfile, OfferingMedia } from '@prisma/client';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../entities/instructor-profile.entity';
import { InstructorApplicationStatus, InstructorProfileStatus, MediaType, OfferingStatus, } from '../enums/instructor.enum';

type OfferingWithRelations = InstructorOffering & {
    subcategory: {
        id: string;
        name: string;
        slug: string;
        category: { id: string; name: string; slug: string }
    };
    media: OfferingMedia[];
};
type ApplicationWithRelations = InstructorApplication & {
    offerings: OfferingWithRelations[];
    profile?: InstructorProfile & {
        user: { id: string; name: string; email: string; imageUrl: string | null; roles: string[] }
    };
};
type ProfileWithRelations = InstructorProfile & {
    offerings: OfferingWithRelations[];
    applications?: ApplicationWithRelations[];
};

export class InstructorMapper {
    static toMediaEntity(media: OfferingMedia): OfferingMediaEntity {
        return {
            id: media.id,
            offeringId: media.offeringId,
            type: media.type as MediaType,
            storageKey: media.storageKey,
            url: media.url,
            mimeType: media.mimeType,
            sizeBytes: media.sizeBytes,
            sortOrder: media.sortOrder,
            createdAt: media.createdAt,
        };
    }

    static toOfferingEntity(offering: OfferingWithRelations): InstructorOfferingEntity {
        return {
            id: offering.id,
            profileId: offering.profileId,
            applicationId: offering.applicationId,
            subcategoryId: offering.subcategoryId,
            title: offering.title,
            description: offering.description,
            hourlyRate: offering.hourlyRate.toString(),
            currency: offering.currency,
            experienceYears: offering.experienceYears,
            status: offering.status as OfferingStatus,
            reviewNote: offering.reviewNote,
            reviewedAt: offering.reviewedAt,
            reviewedBy: offering.reviewedBy,
            createdAt: offering.createdAt,
            updatedAt: offering.updatedAt,
            subcategory: {
                id: offering.subcategory.id,
                name: offering.subcategory.name,
                slug: offering.subcategory.slug,
                category: {
                    id: offering.subcategory.category.id,
                    name: offering.subcategory.category.name,
                    slug: offering.subcategory.category.slug,
                },
            },
            media: offering.media.map(InstructorMapper.toMediaEntity),
        };
    }

    static toApplicationEntity(application: ApplicationWithRelations): InstructorApplicationEntity {
        return {
            id: application.id,
            profileId: application.profileId,
            status: application.status as InstructorApplicationStatus,
            submittedAt: application.submittedAt,
            reviewedAt: application.reviewedAt,
            reviewedBy: application.reviewedBy,
            reviewNote: application.reviewNote,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
            offerings: application.offerings.map(InstructorMapper.toOfferingEntity),
            profile: application.profile ? {
                id: application.profile.id,
                bio: application.profile.bio,
                location: application.profile.location,
                portfolioUrl: application.profile.portfolioUrl,
                status: application.profile.status as InstructorProfileStatus,
                user: {
                    id: application.profile.user.id,
                    name: application.profile.user.name,
                    email: application.profile.user.email,
                    imageUrl: application.profile.user.imageUrl,
                    roles: application.profile.user.roles,
                },
            }
                : undefined,
        };
    }

    static toProfileEntity(profile: ProfileWithRelations): InstructorProfileEntity {
        return {
            id: profile.id,
            userId: profile.userId,
            bio: profile.bio,
            location: profile.location,
            portfolioUrl: profile.portfolioUrl,
            status: profile.status as InstructorProfileStatus,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
            offerings: profile.offerings.map(InstructorMapper.toOfferingEntity),
            latestApplication: profile.applications?.[0] ? InstructorMapper.toApplicationEntity(profile.applications[0]) : null,
        };
    }
}