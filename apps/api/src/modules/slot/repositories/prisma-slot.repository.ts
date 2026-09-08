import { Injectable } from '@nestjs/common';
import { AvailabilityRuleStatus, InstructorProfileStatus, OfferingStatus, Prisma, SlotStatus } from '@prisma/client';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { SlotMapper } from '../mappers/slot.mapper';
import { ISlotRepository } from './interfaces/slot.interface';

@Injectable()
export class PrismaSlotRepository implements ISlotRepository {
    constructor(private readonly _prisma: PrismaService) { }

    findApprovedProfileByUserId(userId: string) {
        return this._prisma.instructorProfile.findFirst({
            where: { userId, status: InstructorProfileStatus.APPROVED },
            select: { id: true },
        });
    }

    findApprovedOfferingForProfile(profileId: string, offeringId: string) {
        return this._prisma.instructorOffering.findFirst({
            where: { id: offeringId, profileId, status: OfferingStatus.APPROVED },
            select: { id: true },
        });
    }

    async createRule(data: Prisma.AvailabilityRuleUncheckedCreateInput) {
        const rule = await this._prisma.availabilityRule.create({ data });
        return SlotMapper.toRuleEntity(rule);
    }

    async updateRule(ruleId: string, data: Prisma.AvailabilityRuleUpdateInput) {
        const rule = await this._prisma.availabilityRule.update({ where: { id: ruleId }, data });
        return SlotMapper.toRuleEntity(rule);
    }

    async findOwnedActiveRule(profileId: string, ruleId: string) {
        const rule = await this._prisma.availabilityRule.findFirst({
            where: { id: ruleId, profileId, status: AvailabilityRuleStatus.ACTIVE },
        });

        return rule ? SlotMapper.toRuleEntity(rule) : null;
    }

    async createException(data: Prisma.AvailabilityExceptionUncheckedCreateInput) {
        const exception = await this._prisma.availabilityException.create({ data });
        return SlotMapper.toExceptionEntity(exception);
    }

    async createSlots(data: Prisma.AvailabilitySlotCreateManyInput[]) {
        if (!data.length) return;
        await this._prisma.availabilitySlot.createMany({ data, skipDuplicates: true });
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