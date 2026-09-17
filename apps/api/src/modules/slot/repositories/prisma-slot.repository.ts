import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { SlotMapper } from '../mappers/slot.mapper';
import { ISlotRepository } from './interfaces/slot.interface';
import { InstructorProfileStatus, OfferingStatus } from '@/modules/instructor/enums/instructor.enum';
import { AvailabilityRuleStatus, SlotStatus } from '../enums/slot.enum';
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
            where: { id: ruleId }, data: {
                title: data.title ?? null,
                startMinute: data.startMinute,
                endMinute: data.endMinute,
                slotDurationMinutes: data.slotDurationMinutes,
                effectiveUntil: data.effectiveUntil ?? null,
                status: data.status
            }
        });
        return SlotMapper.toRuleEntity(rule);
    }

    async findOwnedActiveRule(profileId: string, ruleId: string) {
        const rule = await this._prisma.availabilityRule.findFirst({
            where: { id: ruleId, profileId, status: AvailabilityRuleStatus.ACTIVE },
        });

        return rule ? SlotMapper.toRuleEntity(rule) : null;
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
            }
        });
        return SlotMapper.toExceptionEntity(exception);
    }

    async createSlots(data: CreateSlotInput[]): Promise<void> {
        if (!data.length) return;
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
        });;
    }

    async cancelFutureAvailableSlotsByRule(ruleId: string) {
        await this._prisma.availabilitySlot.updateMany({
            where: { ruleId, status: SlotStatus.AVAILABLE, startTime: { gt: new Date() } },
            data: { status: SlotStatus.CANCELLED },
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
                offeringId: input.offeringId,
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
        const [rules, exceptions, slots] = await this._prisma.$transaction([
            this._prisma.availabilityRule.findMany({
                where: { profileId: input.profileId, offeringId: input.offeringId },
                orderBy: [{ weekday: 'asc' }, { startMinute: 'asc' }],
            }),
            this._prisma.availabilityException.findMany({
                where: {
                    profileId: input.profileId,
                    offeringId: input.offeringId,
                    startTime: { lt: input.to },
                    endTime: { gt: input.from },
                },
                orderBy: { startTime: 'asc' },
            }),
            this._prisma.availabilitySlot.findMany({
                where: {
                    profileId: input.profileId,
                    offeringId: input.offeringId,
                    startTime: { gte: input.from, lte: input.to },
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
                profile: { status: InstructorProfileStatus.APPROVED },
                offering: { status: OfferingStatus.APPROVED },
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

        return slots.map(SlotMapper.toSlotEntity);
    }
}