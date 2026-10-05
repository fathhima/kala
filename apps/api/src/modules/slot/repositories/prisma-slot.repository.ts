import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { SlotMapper } from '../mappers/slot.mapper';
import { ISlotRepository } from './interfaces/slot.interface';
import { AvailabilityExceptionStatus, AvailabilityExceptionType, AvailabilityRuleStatus, SlotStatus } from '../enums/slot.enum';
import { CreateSlotExceptionInput, CreateSlotInput, CreateSlotRuleInput, UpdateSlotRuleInput } from '../types/slot.type';
import { SlotExceptionEntity, SlotRuleEntity } from '../entities/slot.entity';

@Injectable()
export class PrismaSlotRepository implements ISlotRepository {
    constructor(private readonly _prisma: PrismaService) { }

    async createRule(data: CreateSlotRuleInput): Promise<SlotRuleEntity> {
        const rule = await this._prisma.availabilityRule.create({
            data: {
                profileId: data.profileId,
                offeringId: data.offeringId,
                title: data.title ?? null,
                weekday: data.weekday,
                startMinute: data.startMinute,
                endMinute: data.endMinute,
                timezone: data.timezone,
                slotDurationMinutes: data.slotDurationMinutes,
                effectiveFrom: data.effectiveFrom,
                effectiveUntil: data.effectiveUntil ?? null,
            },
        });;
        return SlotMapper.toRuleEntity(rule);
    }

    async updateRule(ruleId: string, data: UpdateSlotRuleInput): Promise<SlotRuleEntity> {
        const rule = await this._prisma.availabilityRule.update({
            where: { id: ruleId },
            data: {
                ...(data.title !== undefined && { title: data.title ? data.title.trim() : null }),
                ...(data.startMinute !== undefined && { startMinute: data.startMinute }),
                ...(data.endMinute !== undefined && { endMinute: data.endMinute }),
                ...(data.slotDurationMinutes !== undefined && { slotDurationMinutes: data.slotDurationMinutes }),
                ...(data.effectiveUntil !== undefined && { effectiveUntil: data.effectiveUntil ?? null }),
                ...(data.status !== undefined && { status: data.status }),
            },
        });
        return SlotMapper.toRuleEntity(rule);
    }

    async findRulesByWeekday(profileId: string, weekday: number): Promise<SlotRuleEntity[]> {
        const rules = await this._prisma.availabilityRule.findMany({
            where: { profileId, weekday },
            include: {
                offering: {
                    select: {
                        id: true,
                        title: true,
                        subcategory: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { startMinute: 'asc' },
        });
        return rules.map(SlotMapper.toRuleEntity);
    }

    async findActiveRulesByProfile(profileId: string): Promise<SlotRuleEntity[]> {
        const rules = await this._prisma.availabilityRule.findMany({
            where: { profileId, status: AvailabilityRuleStatus.ACTIVE },
            include: {
                offering: {
                    select: {
                        id: true,
                        title: true,
                        subcategory: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
        });
        return rules.map(SlotMapper.toRuleEntity);
    }

    async findOwnedRule(profileId: string, ruleId: string) {
        const rule = await this._prisma.availabilityRule.findFirst({
            where: { id: ruleId, profileId },
            include: {
                offering: {
                    select: {
                        id: true,
                        title: true,
                        subcategory: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return rule ? SlotMapper.toRuleEntity(rule) : null;
    }

    async findOwnedActiveRule(profileId: string, ruleId: string) {
        const rule = await this._prisma.availabilityRule.findFirst({
            where: { id: ruleId, profileId, status: AvailabilityRuleStatus.ACTIVE },
            include: {
                offering: {
                    select: {
                        id: true,
                        title: true,
                        subcategory: { select: { id: true, name: true } },
                    },
                },
            },
        });

        return rule ? SlotMapper.toRuleEntity(rule) : null;
    }

    async deleteRule(ruleId: string): Promise<void> {
        await this._prisma.availabilityRule.delete({
            where: { id: ruleId },
        });
    }

    async createException(data: CreateSlotExceptionInput): Promise<SlotExceptionEntity> {
        const exception = await this._prisma.availabilityException.create({
            data: {
                profileId: data.profileId,
                offeringId: data.offeringId,
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                timezone: data.timezone,
                slotDurationMinutes: data.slotDurationMinutes,
                type: data.type
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
        });
        return SlotMapper.toExceptionEntity(exception);
    }

    async findOwnedException(profileId: string, exceptionId: string): Promise<SlotExceptionEntity | null> {
        const exception = await this._prisma.availabilityException.findFirst({
            where: { id: exceptionId, profileId },
            include: {
                offering: {
                    select: {
                        id: true,
                        title: true,
                        subcategory: { select: { id: true, name: true } },
                    },
                },
            },
        });
        return exception ? SlotMapper.toExceptionEntity(exception) : null;
    }

    async findOverlappingBlockException(input: {
        profileId: string;
        offeringId?: string;
        startTime: Date;
        endTime: Date;
    }): Promise<SlotExceptionEntity | null> {
        const exception = await this._prisma.availabilityException.findFirst({
            where: {
                profileId: input.profileId,
                type: AvailabilityExceptionType.BLOCK,
                status: AvailabilityExceptionStatus.ACTIVE,
                ...(input.offeringId
                    ? { OR: [{ offeringId: input.offeringId }, { offeringId: null }] }
                    : {}),
                startTime: { lt: input.endTime },
                endTime: { gt: input.startTime },
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
        });
        return exception ? SlotMapper.toExceptionEntity(exception) : null;
    }

    async findActiveBlockExceptionsInRange(input: {
        profileId: string;
        offeringId?: string;
        from: Date;
        to: Date;
    }): Promise<SlotExceptionEntity[]> {
        const exceptions = await this._prisma.availabilityException.findMany({
            where: {
                profileId: input.profileId,
                type: AvailabilityExceptionType.BLOCK,
                status: AvailabilityExceptionStatus.ACTIVE,
                ...(input.offeringId
                    ? { OR: [{ offeringId: input.offeringId }, { offeringId: null }] }
                    : {}),
                startTime: { lt: input.to },
                endTime: { gt: input.from },
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
        });
        return exceptions.map(SlotMapper.toExceptionEntity);
    }

    async deleteException(exceptionId: string): Promise<void> {
        await this._prisma.availabilityException.delete({
            where: { id: exceptionId },
        });
    }

    async createSlots(data: CreateSlotInput[]): Promise<void> {
        if (!data.length) return;

        // If there are unbooked CANCELLED slots at these exact times, delete them first
        // so that they don't block inserting new AVAILABLE slots.
        const conditions = data.map((s) => ({
            offeringId: s.offeringId,
            startTime: s.startTime,
            endTime: s.endTime,
        }));

        await this._prisma.availabilitySlot.deleteMany({
            where: {
                status: SlotStatus.CANCELLED,
                bookings: { none: {} },
                OR: conditions,
            },
        });

        await this._prisma.availabilitySlot.createMany({
            data: data.map((slot) => ({
                profileId: slot.profileId,
                offeringId: slot.offeringId,
                ruleId: slot.ruleId,
                exceptionId: slot.exceptionId,
                title: slot.title,
                startTime: slot.startTime,
                endTime: slot.endTime,
                timezone: slot.timezone,
                status: slot.status,
            })),
            skipDuplicates: true,
        });
    }

    async cancelFutureAvailableSlotsByRule(ruleId: string) {
        await this._prisma.availabilitySlot.updateMany({
            where: { ruleId, status: SlotStatus.AVAILABLE, startTime: { gt: new Date() } },
            data: { status: SlotStatus.CANCELLED },
        });
    }

    async deleteUnbookedFutureSlotsByRule(ruleId: string): Promise<void> {
        await this._prisma.availabilitySlot.deleteMany({
            where: {
                ruleId,
                bookings: { none: {} },
                startTime: { gt: new Date() },
            },
        });
        await this._prisma.availabilitySlot.updateMany({
            where: {
                ruleId,
                status: SlotStatus.AVAILABLE,
                startTime: { gt: new Date() },
            },
            data: { status: SlotStatus.CANCELLED },
        });
    }

    async deleteUnbookedSlotsByException(exceptionId: string): Promise<void> {
        await this._prisma.availabilitySlot.deleteMany({
            where: {
                exceptionId,
                bookings: { none: {} },
                startTime: { gt: new Date() },
            },
        });
    }

    async cancelAvailableSlotsInRange(input: {
        profileId: string;
        offeringId?: string;
        startTime: Date;
        endTime: Date;
    }) {
        await this._prisma.availabilitySlot.updateMany({
            where: {
                profileId: input.profileId,
                ...(input.offeringId ? { offeringId: input.offeringId } : {}),
                status: SlotStatus.AVAILABLE,
                startTime: { lt: input.endTime },
                endTime: { gt: input.startTime },
            },
            data: { status: SlotStatus.CANCELLED },
        });
    }

    async findInstructorAvailability(input: {
        profileId: string;
        offeringId?: string;
        from: Date;
        to: Date;
    }) {
        const offeringInclude = {
            select: {
                id: true,
                title: true,
                subcategory: { select: { id: true, name: true } },
            },
        };

        const [rules, exceptions, slots] = await this._prisma.$transaction([
            this._prisma.availabilityRule.findMany({
                where: {
                    profileId: input.profileId,
                    ...(input.offeringId ? { offeringId: input.offeringId } : {}),
                },
                include: { offering: offeringInclude },
                orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
            }),
            this._prisma.availabilityException.findMany({
                where: {
                    profileId: input.profileId,
                    ...(input.offeringId
                        ? { OR: [{ offeringId: input.offeringId }, { offeringId: null }] }
                        : {}),
                    startTime: { lt: input.to },
                    endTime: { gt: input.from },
                },
                include: { offering: offeringInclude },
                orderBy: { startTime: 'asc' },
            }),
            this._prisma.availabilitySlot.findMany({
                where: {
                    profileId: input.profileId,
                    ...(input.offeringId ? { offeringId: input.offeringId } : {}),
                    startTime: { gte: input.from, lte: input.to },
                },
                include: { offering: offeringInclude },
                orderBy: { startTime: 'asc' },
            }),
        ]);

        return SlotMapper.toInstructorAvailabilityEntity({ rules, exceptions, slots });
    }

    async findPublicSlots(input: {
        profileId: string;
        offeringId?: string;
        from: Date;
        to: Date;
    }) {
        const slots = await this._prisma.availabilitySlot.findMany({
            where: {
                profileId: input.profileId,
                offeringId: input.offeringId,
                status: SlotStatus.AVAILABLE,
                startTime: { gte: input.from, lte: input.to, gt: new Date() },
            },
            orderBy: { startTime: 'asc' },
        });

        return slots.map(SlotMapper.toSlotEntity);
    }
}