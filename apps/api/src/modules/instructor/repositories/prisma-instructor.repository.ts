import { ConflictException, Injectable } from '@nestjs/common';
import { InstructorApplicationStatus, InstructorProfileStatus, MediaType, OfferingStatus, Prisma, Role, } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { PaginatedResult } from '@/shared/types';
import { InstructorMapper } from '../mappers/instructor.mapper';
import { InstructorApplicationEntity, InstructorOfferingEntity, InstructorProfileEntity, OfferingMediaEntity, } from '../entities/instructor-profile.entity';
import { InstructorRepository } from './interfaces/instructor.repository';
import { ReviewableOfferingStatus } from '../types/offering-status.type';
import { AdminInstructorRepository } from './interfaces/admin-instructor.repositoty';

const offeringInclude = {
    media: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    subcategory: {
        include: {
            category: true,
        },
    },
} satisfies Prisma.InstructorOfferingInclude;

const applicationInclude = {
    offerings: {
        include: offeringInclude,
        orderBy: { createdAt: 'asc' },
    },
    profile: {
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    imageUrl: true,
                    roles: true,
                },
            },
        },
    },
} satisfies Prisma.InstructorApplicationInclude;

@Injectable()
export class PrismaInstructorRepository implements InstructorRepository, AdminInstructorRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findWorkspaceByUserId(userId: string,): Promise<InstructorProfileEntity | null> {
        const profile = await this.prisma.instructorProfile.findUnique({
            where: { userId },
            include: {
                offerings: {
                    include: offeringInclude,
                    orderBy: { createdAt: 'desc' },
                },
                applications: {
                    include: applicationInclude,
                    orderBy: { submittedAt: 'desc' },
                    take: 1,
                },
            },
        });

        return profile ? InstructorMapper.toProfileEntity(profile) : null;
    }

    async upsertProfile(userId: string, input: { bio?: string; location?: string },): Promise<InstructorProfileEntity> {
        const profile = await this.prisma.instructorProfile.upsert({
            where: { userId },
            create: {
                userId,
                bio: input.bio,
                location: input.location,
            },
            update: input,
            include: {
                offerings: {
                    include: offeringInclude,
                    orderBy: { createdAt: 'desc' },
                },
                applications: {
                    include: applicationInclude,
                    orderBy: { submittedAt: 'desc' },
                    take: 1,
                },
            },
        });

        return InstructorMapper.toProfileEntity(profile);
    }

    async isSelectableSubcategory(subcategoryId: string): Promise<boolean> {
        const subcategory = await this.prisma.subcategory.findFirst({
            where: {
                id: subcategoryId,
                isActive: true,
                category: { isActive: true },
            },
            select: { id: true },
        });

        return Boolean(subcategory);
    }

    async createOffering(profileId: string, input: {
        subcategoryId: string;
        title?: string;
        description?: string;
        hourlyRate: number;
        currency?: string;
        experienceYears?: number;
    },
    ): Promise<InstructorOfferingEntity> {
        const offering = await this.prisma.instructorOffering.create({
            data: {
                ...input,
                profileId,
                currency: input.currency?.toUpperCase() ?? 'INR',
            },
            include: offeringInclude,
        });

        return InstructorMapper.toOfferingEntity(offering);
    }

    async updateOffering(offeringId: string, input: {
        subcategoryId?: string;
        title?: string;
        description?: string;
        hourlyRate?: number;
        currency?: string;
        experienceYears?: number;
    },
    ): Promise<InstructorOfferingEntity> {
        const offering = await this.prisma.instructorOffering.update({
            where: { id: offeringId },
            data: {
                ...input,
                currency: input.currency?.toUpperCase(),
            },
            include: offeringInclude,
        });

        return InstructorMapper.toOfferingEntity(offering);
    }

    async deleteOffering(offeringId: string): Promise<void> {
        await this.prisma.instructorOffering.delete({ where: { id: offeringId } });
    }

    async findOfferingById(offeringId: string,): Promise<InstructorOfferingEntity | null> {
        const offering = await this.prisma.instructorOffering.findUnique({
            where: { id: offeringId },
            include: offeringInclude,
        });

        return offering ? InstructorMapper.toOfferingEntity(offering) : null;
    }

    async countMedia(offeringId: string, type: MediaType): Promise<number> {
        return this.prisma.offeringMedia.count({
            where: { offeringId, type },
        });
    }

    async createMedia(input: {
        offeringId: string;
        type: MediaType;
        storageKey: string;
        mimeType: string;
        sizeBytes: number;
        sortOrder: number;
    }): Promise<OfferingMediaEntity> {
        const media = await this.prisma.offeringMedia.create({
            data: {
                ...input,
                url: input.storageKey,
            },
        });

        return InstructorMapper.toMediaEntity(media);
    }

    async findMediaById(mediaId: string): Promise<OfferingMediaEntity | null> {
        const media = await this.prisma.offeringMedia.findUnique({
            where: { id: mediaId },
        });

        return media ? InstructorMapper.toMediaEntity(media) : null;
    }

    async deleteMedia(mediaId: string): Promise<void> {
        await this.prisma.offeringMedia.delete({ where: { id: mediaId } });
    }

    async submitApplication(profileId: string, offeringIds: string[],): Promise<InstructorApplicationEntity> {
        return this.prisma.$transaction(async (tx) => {
            const application = await tx.instructorApplication.create({
                data: { profileId },
            });

            const updated = await tx.instructorOffering.updateMany({
                where: {
                    id: { in: offeringIds },
                    profileId,
                    status: {
                        in: [
                            OfferingStatus.DRAFT,
                            OfferingStatus.REJECTED,
                            OfferingStatus.CHANGES_REQUESTED,
                        ],
                    },
                },
                data: {
                    applicationId: application.id,
                    status: OfferingStatus.PENDING,
                    reviewNote: null,
                    reviewedAt: null,
                    reviewedBy: null,
                },
            });

            if (updated.count !== offeringIds.length) {
                throw new ConflictException(
                    'One or more offerings are no longer available for submission',
                );
            }

            await tx.instructorProfile.update({
                where: { id: profileId },
                data: { status: InstructorProfileStatus.PENDING },
            });

            const result = await tx.instructorApplication.findUniqueOrThrow({
                where: { id: application.id },
                include: applicationInclude,
            });

            return InstructorMapper.toApplicationEntity(result);
        });
    }

    async cancelPendingApplication(profileId: string, applicationId: string,): Promise<boolean> {
        return this.prisma.$transaction(async (tx) => {
            const application = await tx.instructorApplication.findFirst({
                where: {
                    id: applicationId,
                    profileId,
                    status: InstructorApplicationStatus.PENDING,
                },
                select: { id: true },
            });

            if (!application) {
                return false;
            }

            await tx.instructorOffering.updateMany({
                where: {
                    profileId,
                    applicationId,
                    status: OfferingStatus.PENDING,
                },
                data: {
                    applicationId: null,
                    status: OfferingStatus.DRAFT,
                    reviewNote: null,
                    reviewedAt: null,
                    reviewedBy: null,
                },
            });

            await tx.instructorApplication.update({
                where: { id: applicationId },
                data: {
                    status: InstructorApplicationStatus.CANCELLED,
                    reviewedAt: new Date(),
                    reviewedBy: null,
                    reviewNote: null,
                },
            });

            const approvedOfferingCount = await tx.instructorOffering.count({
                where: {
                    profileId,
                    status: OfferingStatus.APPROVED,
                },
            });

            await tx.instructorProfile.update({
                where: { id: profileId },
                data: {
                    status: approvedOfferingCount > 0
                        ? InstructorProfileStatus.APPROVED
                        : InstructorProfileStatus.DRAFT,
                },
            });

            return true;
        });
    }

    async findApplicationsForAdmin(input: {
        page: number;
        limit: number;
        status?: InstructorApplicationStatus;
        search?: string;
    }): Promise<PaginatedResult<InstructorApplicationEntity>> {
        const skip = (input.page - 1) * input.limit;
        const where: Prisma.InstructorApplicationWhereInput = {
            status: input.status,
        };

        if (input.search?.trim()) {
            where.profile = {
                user: {
                    OR: [
                        { name: { contains: input.search.trim(), mode: 'insensitive' } },
                        { email: { contains: input.search.trim(), mode: 'insensitive' } },
                    ],
                },
            };
        }

        const [applications, total] = await this.prisma.$transaction([
            this.prisma.instructorApplication.findMany({
                where,
                skip,
                take: input.limit,
                include: applicationInclude,
                orderBy: { submittedAt: 'asc' },
            }),
            this.prisma.instructorApplication.count({ where }),
        ]);

        return {
            items: applications.map(InstructorMapper.toApplicationEntity),
            total,
            page: input.page,
            limit: input.limit,
        };
    }

    async findApplicationForAdmin(applicationId: string,): Promise<InstructorApplicationEntity | null> {
        const application = await this.prisma.instructorApplication.findUnique({
            where: { id: applicationId },
            include: applicationInclude,
        });

        return application ? InstructorMapper.toApplicationEntity(application) : null;
    }

    async reviewOffering(
        applicationId: string,
        offeringId: string,
        adminUserId: string,
        decision: ReviewableOfferingStatus,
        reviewNote?: string,
    ): Promise<InstructorApplicationEntity | null> {
        return this.prisma.$transaction(async (tx) => {
            const offering = await tx.instructorOffering.findFirst({
                where: {
                    id: offeringId,
                    applicationId,
                    status: OfferingStatus.PENDING,
                },
                include: {
                    application: {
                        include: {
                            profile: {
                                include: {
                                    user: { select: { id: true, roles: true } },
                                },
                            },
                        },
                    },
                },
            });

            if (!offering?.application) {
                return null;
            }

            await tx.instructorOffering.update({
                where: { id: offeringId },
                data: {
                    status: decision,
                    reviewNote: reviewNote ?? null,
                    reviewedAt: new Date(),
                    reviewedBy: adminUserId,
                },
            });

            const applicationOfferings = await tx.instructorOffering.findMany({
                where: { applicationId },
                select: { status: true },
            });

            const hasPending = applicationOfferings.some(
                (item) => item.status === OfferingStatus.PENDING,
            );
            const hasChangesRequested = applicationOfferings.some(
                (item) => item.status === OfferingStatus.CHANGES_REQUESTED,
            );
            const hasApproved = applicationOfferings.some(
                (item) => item.status === OfferingStatus.APPROVED,
            );

            const applicationStatus = hasPending
                ? InstructorApplicationStatus.PENDING
                : hasChangesRequested
                    ? InstructorApplicationStatus.CHANGES_REQUESTED
                    : hasApproved
                        ? InstructorApplicationStatus.APPROVED
                        : InstructorApplicationStatus.REJECTED;

            await tx.instructorApplication.update({
                where: { id: applicationId },
                data: {
                    status: applicationStatus,
                    reviewedAt: hasPending ? null : new Date(),
                    reviewedBy: hasPending ? null : adminUserId,
                },
            });

            const approvedOfferingExists = await tx.instructorOffering.count({
                where: {
                    profileId: offering.profileId,
                    status: OfferingStatus.APPROVED,
                },
            });

            const profileStatus = approvedOfferingExists > 0
                ? InstructorProfileStatus.APPROVED
                : applicationStatus === InstructorApplicationStatus.CHANGES_REQUESTED
                    ? InstructorProfileStatus.CHANGES_REQUESTED
                    : applicationStatus === InstructorApplicationStatus.REJECTED
                        ? InstructorProfileStatus.REJECTED
                        : InstructorProfileStatus.PENDING;

            await tx.instructorProfile.update({
                where: { id: offering.profileId },
                data: { status: profileStatus },
            });

            if (
                decision === OfferingStatus.APPROVED &&
                !offering.application.profile.user.roles.includes(Role.INSTRUCTOR)
            ) {
                await tx.user.update({
                    where: { id: offering.application.profile.user.id },
                    data: {
                        roles: {
                            set: [
                                ...offering.application.profile.user.roles,
                                Role.INSTRUCTOR,
                            ],
                        },
                    },
                });
            }

            const result = await tx.instructorApplication.findUnique({
                where: { id: applicationId },
                include: applicationInclude,
            });

            return result ? InstructorMapper.toApplicationEntity(result) : null;
        });
    }
}