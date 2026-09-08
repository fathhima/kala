import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, } from '@nestjs/common';
import { AvailabilityExceptionType, AvailabilityRuleStatus, Prisma, SlotStatus, } from '@prisma/client';
import { type ISlotRepository, SLOT_REPOSITORY } from '../repositories/interfaces/slot.interface';
import { ISlotService } from './interfaces/slot.service.interface';
import { SlotRuleEntity } from '../entities/slot.entity';
import { CreateSlotExceptionDto, CreateSlotRuleDto, SlotAvailabilityQueryDto, UpdateSlotRuleDto } from '../dto/request/slot.request.dto';

const DEFAULT_TIMEZONE = 'Asia/Kolkata';
const GENERATION_DAYS = 90;

@Injectable()
export class SlotService implements ISlotService {
    constructor(
        @Inject(SLOT_REPOSITORY)
        private readonly _slotRepository: ISlotRepository,
    ) { }

    async getInstructorAvailability(userId: string, query: SlotAvailabilityQueryDto) {
        const profile = await this._getApprovedProfile(userId);
        const range = this._rangeFromQuery(query);

        return this._slotRepository.findInstructorAvailability({
            profileId: profile.id,
            offeringId: query.offeringId,
            from: range.from,
            to: range.to,
        });
    }

    async createRule(userId: string, dto: CreateSlotRuleDto) {
        const profile = await this._getApprovedProfile(userId);
        await this._assertApprovedOffering(profile.id, dto.offeringId);
        this._assertValidMinutes(dto.startMinute, dto.endMinute, dto.slotDurationMinutes);

        const rule = await this._slotRepository.createRule({
            profileId: profile.id,
            offeringId: dto.offeringId,
            title: dto.title?.trim() || null,
            weekday: dto.weekday,
            startMinute: dto.startMinute,
            endMinute: dto.endMinute,
            timezone: dto.timezone?.trim() || DEFAULT_TIMEZONE,
            slotDurationMinutes: dto.slotDurationMinutes,
            effectiveFrom: new Date(dto.effectiveFrom),
            effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null,
        })

        await this._materializeRuleSlots(rule);

        return rule;
    }

    async updateRule(userId: string, ruleId: string, dto: UpdateSlotRuleDto) {
        const profile = await this._getApprovedProfile(userId);
        const existing = await this._slotRepository.findOwnedActiveRule(profile.id, ruleId);

        if (!existing) {
            throw new NotFoundException('Availability rule not found');
        }

        const startMinute = dto.startMinute ?? existing.startMinute;
        const endMinute = dto.endMinute ?? existing.endMinute;
        const duration = dto.slotDurationMinutes ?? existing.slotDurationMinutes;

        this._assertValidMinutes(startMinute, endMinute, duration);

        await this._slotRepository.cancelFutureAvailableSlotsByRule(ruleId);

        const updated = await this._slotRepository.updateRule(ruleId, {
            title: dto.title === undefined ? undefined : dto.title.trim() || null,
            startMinute,
            endMinute,
            slotDurationMinutes: duration,
            effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : undefined,
        })

        await this._materializeRuleSlots(updated);

        return updated;
    }

    async disableRule(userId: string, ruleId: string): Promise<void> {
        const profile = await this._getApprovedProfile(userId);
        const rule = await this._slotRepository.findOwnedActiveRule(profile.id, ruleId);

        if (!rule) {
            throw new NotFoundException('Availability rule not found');
        }

        await this._slotRepository.updateRule(ruleId, {
            status: AvailabilityRuleStatus.INACTIVE,
        });

        await this._slotRepository.cancelFutureAvailableSlotsByRule(ruleId);
    }

    async createException(userId: string, dto: CreateSlotExceptionDto) {
        const profile = await this._getApprovedProfile(userId);
        const startTime = new Date(dto.startTime);
        const endTime = new Date(dto.endTime);

        if (startTime <= new Date() || endTime <= startTime) {
            throw new BadRequestException('Use a future start time and valid end time');
        }

        if (dto.offeringId) {
            await this._assertApprovedOffering(profile.id, dto.offeringId);
        }

        if (dto.type === AvailabilityExceptionType.EXTRA && !dto.offeringId) {
            throw new BadRequestException('Extra availability requires an offering');
        }

        if (dto.type === AvailabilityExceptionType.EXTRA && !dto.slotDurationMinutes) {
            throw new BadRequestException('Extra availability requires slot duration');
        }

        const exception = await this._slotRepository.createException({
            profileId: profile.id,
            offeringId: dto.offeringId ?? null,
            type: dto.type,
            title: dto.title?.trim() || null,
            startTime,
            endTime,
            timezone: dto.timezone?.trim() || DEFAULT_TIMEZONE,
            slotDurationMinutes: dto.slotDurationMinutes ?? null,
        });

        if (dto.type === AvailabilityExceptionType.BLOCK) {
            await this._slotRepository.cancelAvailableSlotsInRange({
                profileId: profile.id,
                offeringId: dto.offeringId,
                startTime,
                endTime,
            });
        }

        if (dto.type === AvailabilityExceptionType.EXTRA) {
            const slots = this._splitRangeIntoSlots({
                profileId: profile.id,
                offeringId: dto.offeringId!,
                exceptionId: exception.id,
                title: dto.title,
                startTime,
                endTime,
                timezone: dto.timezone?.trim() || DEFAULT_TIMEZONE,
                durationMinutes: dto.slotDurationMinutes!,
            });

            await this._slotRepository.createSlots(slots);
        }

        return exception;
    }

    async getPublicAvailability(profileId: string, query: SlotAvailabilityQueryDto) {
        const range = this._rangeFromQuery(query);

        return this._slotRepository.findPublicSlots({
            profileId,
            offeringId: query.offeringId,
            from: range.from,
            to: range.to,
        });
    }

    private async _getApprovedProfile(userId: string) {
        const profile = await this._slotRepository.findApprovedProfileByUserId(userId);

        if (!profile) {
            throw new ForbiddenException('Only approved instructors can manage availability');
        }

        return profile;
    }

    private async _assertApprovedOffering(profileId: string, offeringId: string) {
        const offering = await this._slotRepository.findApprovedOfferingForProfile(
            profileId,
            offeringId,
        );

        if (!offering) {
            throw new NotFoundException('Approved offering not found');
        }
    }

    private _assertValidMinutes(startMinute: number, endMinute: number, duration: number) {
        if (endMinute <= startMinute) {
            throw new BadRequestException('End time must be after start time');
        }

        const totalMinutes = endMinute - startMinute;

        if (duration > totalMinutes) {
            throw new BadRequestException('Slot duration cannot exceed availability window');
        }

        if (totalMinutes % duration !== 0) {
            throw new BadRequestException('Availability window must divide evenly by slot duration');
        }
    }

    private async _materializeRuleSlots(rule: SlotRuleEntity) {
        const generationEnd = new Date();
        generationEnd.setDate(generationEnd.getDate() + GENERATION_DAYS);

        const effectiveFrom = new Date(rule.effectiveFrom);
        const effectiveUntil = rule.effectiveUntil
            ? new Date(rule.effectiveUntil)
            : generationEnd;

        const end = effectiveUntil < generationEnd ? effectiveUntil : generationEnd;
        const cursor = new Date(effectiveFrom > new Date() ? effectiveFrom : new Date());

        const slots: Prisma.AvailabilitySlotCreateManyInput[] = [];

        while (cursor <= end) {
            if (cursor.getDay() === rule.weekday) {
                const dateKey = cursor.toISOString().slice(0, 10);
                const dayStart = this._dateFromMinute(dateKey, rule.startMinute);
                const dayEnd = this._dateFromMinute(dateKey, rule.endMinute);

                slots.push(
                    ...this._splitRangeIntoSlots({
                        profileId: rule.profileId,
                        offeringId: rule.offeringId,
                        ruleId: rule.id,
                        title: rule.title,
                        startTime: dayStart,
                        endTime: dayEnd,
                        timezone: rule.timezone,
                        durationMinutes: rule.slotDurationMinutes,
                    }),
                );
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        try {
            await this._slotRepository.createSlots(slots);
        } catch {
            throw new ConflictException('Availability overlaps existing slots');
        }
    }

    private _splitRangeIntoSlots(input: {
        profileId: string;
        offeringId: string;
        ruleId?: string;
        exceptionId?: string;
        title?: string | null;
        startTime: Date;
        endTime: Date;
        timezone: string;
        durationMinutes: number;
    }): Prisma.AvailabilitySlotCreateManyInput[] {
        const slots: Prisma.AvailabilitySlotCreateManyInput[] = [];
        let cursor = new Date(input.startTime);

        while (cursor < input.endTime) {
            const end = new Date(cursor.getTime() + input.durationMinutes * 60_000);

            if (end > input.endTime) break;

            slots.push({
                profileId: input.profileId,
                offeringId: input.offeringId,
                ruleId: input.ruleId,
                exceptionId: input.exceptionId,
                title: input.title?.trim() || null,
                startTime: cursor,
                endTime: end,
                timezone: input.timezone,
                status: SlotStatus.AVAILABLE,
            });

            cursor = end;
        }

        return slots;
    }

    private _dateFromMinute(date: string, minute: number) {
        const hours = Math.floor(minute / 60).toString().padStart(2, '0');
        const mins = (minute % 60).toString().padStart(2, '0');

        return new Date(`${date}T${hours}:${mins}:00+05:30`);
    }

    private _rangeFromQuery(query: SlotAvailabilityQueryDto) {
        const from = query.from ? new Date(query.from) : new Date();
        const to = query.to ? new Date(query.to) : new Date();

        if (!query.to) {
            to.setDate(to.getDate() + 30);
        }

        if (to <= from) {
            throw new BadRequestException('Invalid availability date range');
        }

        return { from, to };
    }
}