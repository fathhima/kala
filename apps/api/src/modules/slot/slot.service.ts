import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    InstructorProfileStatus,
    OfferingStatus,
    SlotStatus,
} from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CreateSlotsDto, InstructorSlotQueryDto, PublicAvailabilityQueryDto, UpdateSlotDto } from './request/slot.request.dto';


@Injectable()
export class SchedulingService {
    constructor(private readonly prisma: PrismaService) { }

    async createSlots(userId: string, dto: CreateSlotsDto) {
        const profile = await this.prisma.instructorProfile.findUnique({
            where: { userId },
            select: { id: true, status: true },
        });

        if (!profile || profile.status !== InstructorProfileStatus.APPROVED) {
            throw new ForbiddenException('Only approved instructors can create slots');
        }

        const offering = await this.prisma.instructorOffering.findFirst({
            where: {
                id: dto.offeringId,
                profileId: profile.id,
                status: OfferingStatus.APPROVED,
            },
            select: { id: true },
        });

        if (!offering) {
            throw new NotFoundException('Approved offering not found');
        }

        const now = new Date();
        const timezone = dto.timezone?.trim() || 'Asia/Kolkata';

        const slots = dto.slots.map((slot) => {
            const startTime = new Date(slot.startTime);
            const endTime = new Date(slot.endTime);

            if (startTime <= now || endTime <= startTime) {
                throw new BadRequestException('Each slot must be in the future with a valid duration');
            }

            const durationMinutes = (endTime.getTime() - startTime.getTime()) / 60_000;

            if (durationMinutes < 15 || durationMinutes > 480) {
                throw new BadRequestException('Slot duration must be between 15 and 480 minutes');
            }

            return {
                profileId: profile.id,
                offeringId: offering.id,
                title: slot.title?.trim() || null,
                startTime,
                endTime,
                timezone,
            };
        });

        const uniqueRanges = new Set(
            slots.map((slot) => `${slot.startTime.toISOString()}-${slot.endTime.toISOString()}`),
        );

        if (uniqueRanges.size !== slots.length) {
            throw new BadRequestException('Duplicate slots are not allowed');
        }

        try {
            await this.prisma.availabilitySlot.createMany({ data: slots });
        } catch {
            throw new ConflictException('One or more slots overlap an existing active slot');
        }

        return this.listInstructorSlots(userId, {});
    }

    async listInstructorSlots(userId: string, query: InstructorSlotQueryDto) {
        const profile = await this.prisma.instructorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!profile) {
            return [];
        }

        return this.prisma.availabilitySlot.findMany({
            where: {
                profileId: profile.id,
                status: query.status,
                startTime: {
                    gte: query.from ? new Date(query.from) : undefined,
                    lte: query.to ? new Date(query.to) : undefined,
                },
            },
            include: {
                offering: {
                    select: {
                        id: true,
                        title: true,
                        subcategory: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { startTime: 'asc' },
        });
    }

    async updateSlot(userId: string, slotId: string, dto: UpdateSlotDto) {
        const profile = await this.prisma.instructorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!profile) {
            throw new NotFoundException('Instructor profile not found');
        }

        const slot = await this.prisma.availabilitySlot.findFirst({
            where: {
                id: slotId,
                profileId: profile.id,
                status: SlotStatus.AVAILABLE,
                startTime: { gt: new Date() },
            },
        });

        if (!slot) {
            throw new ConflictException('Only future available slots can be edited');
        }

        const startTime = dto.startTime ? new Date(dto.startTime) : slot.startTime;
        const endTime = dto.endTime ? new Date(dto.endTime) : slot.endTime;

        if (startTime <= new Date() || endTime <= startTime) {
            throw new BadRequestException('Use a future start time and valid end time');
        }

        try {
            return await this.prisma.availabilitySlot.update({
                where: { id: slot.id },
                data: {
                    startTime,
                    endTime,
                    title: dto.title === undefined ? undefined : dto.title.trim() || null,
                },
            });
        } catch {
            throw new ConflictException('This time overlaps another active slot');
        }
    }

    async cancelSlot(userId: string, slotId: string) {
        const profile = await this.prisma.instructorProfile.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!profile) {
            throw new NotFoundException('Instructor profile not found');
        }

        const result = await this.prisma.availabilitySlot.updateMany({
            where: {
                id: slotId,
                profileId: profile.id,
                status: SlotStatus.AVAILABLE,
                startTime: { gt: new Date() },
            },
            data: { status: SlotStatus.CANCELLED },
        });

        if (result.count !== 1) {
            throw new ConflictException('Only future available slots can be cancelled');
        }
    }

    async getPublicAvailability(
        profileId: string,
        query: PublicAvailabilityQueryDto,
    ) {
        const dayStart = new Date(`${query.date}T00:00:00+05:30`);
        const dayEnd = new Date(dayStart);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

        return this.prisma.availabilitySlot.findMany({
            where: {
                profileId,
                offeringId: query.offeringId,
                status: SlotStatus.AVAILABLE,
                startTime: { gte: dayStart, lt: dayEnd, gt: new Date() },
                profile: { status: InstructorProfileStatus.APPROVED },
                offering: { status: OfferingStatus.APPROVED },
            },
            select: {
                id: true,
                offeringId: true,
                title: true,
                startTime: true,
                endTime: true,
                timezone: true,
            },
            orderBy: { startTime: 'asc' },
        });
    }
}