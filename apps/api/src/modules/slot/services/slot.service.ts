import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type ISlotRepository, SLOT_REPOSITORY } from '../repositories/interfaces/slot.interface';
import { ISlotService } from './interfaces/slot.service.interface';
import { SlotRuleEntity } from '../entities/slot.entity';
import { AvailabilityExceptionType, AvailabilityRuleStatus, SlotStatus } from '../enums/slot.enum';
import { CreateSlotInput } from '../types/slot.type';
import { SlotAvailabilityQueryInput } from '../types/slot-availability-query.type';
import { ConfigService } from '@nestjs/config';
import { type IInstructorService, INSTRUCTOR_SERVICE } from '@/modules/instructor/services/interfaces/instructor.service.interface';
import { InstructorProfileStatus, OfferingStatus } from '@/modules/instructor/enums/instructor.enum';
import { InstructorSlotAvailabilityResponseDto, PublicSlotListResponseDto, SlotExceptionResponseDto, SlotRuleResponseDto } from '../dto/response/slot-response.dto';
import { CreateSlotExceptionDto, CreateSlotRuleDto, SlotAvailabilityQueryDto, UpdateSlotRuleDto } from '../dto/request/slot.request.dto';
import { MessageResponseDto } from '@/shared/dto/response/message-response.dto';
import { REDIS_SERVICE, type IRedisService } from '@/shared/redis/repositories/interfaces/key-value-store.interface';
import { LOGGER_SERVICE, type ILoggerService } from '@/shared/logger/repositories/interfaces/logger.interface';

@Injectable()
export class SlotService implements ISlotService {
    constructor(
        @Inject(SLOT_REPOSITORY)
        private readonly _slotRepository: ISlotRepository,
        @Inject(INSTRUCTOR_SERVICE)
        private readonly _instructorService: IInstructorService,
        private readonly _configService: ConfigService,
        @Inject(REDIS_SERVICE)
        private readonly _redisService: IRedisService,
        @Inject(LOGGER_SERVICE)
        private readonly _logger: ILoggerService,
    ) { }

    async getInstructorAvailability(userId: string, query: SlotAvailabilityQueryDto): Promise<InstructorSlotAvailabilityResponseDto> {
        const profile = await this._instructorService.findApprovedProfileByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Approved instructor profile not found');
        }
        const range = this._rangeFromQuery({
            offeringId: query.offeringId,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        });
        const availability = await this._slotRepository.findInstructorAvailability({
            profileId: profile.id,
            offeringId: query.offeringId,
            from: range.from,
            to: range.to,
        });
        return InstructorSlotAvailabilityResponseDto.fromEntity('Instructor availability fetched successfully', availability);
    }

    async createRule(userId: string, dto: CreateSlotRuleDto): Promise<SlotRuleResponseDto> {
        const profile = await this._instructorService.findApprovedProfileByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Approved instructor profile not found');
        }
        await this._instructorService.findApprovedOfferingForProfile(profile.id, dto.offeringId);
        this._assertValidMinutes(dto.startMinute, dto.endMinute, dto.slotDurationMinutes);
        const existingRules = await this._slotRepository.findRulesByWeekday(profile.id, dto.weekday);
        const effectiveFrom = new Date(dto.effectiveFrom);
        const effectiveUntil = dto.effectiveUntil ? new Date(dto.effectiveUntil) : null;
        this._validateRuleOverlap(existingRules, null, dto.weekday, dto.startMinute, dto.endMinute, effectiveFrom, effectiveUntil);
        const rule = await this._slotRepository.createRule({
            profileId: profile.id,
            offeringId: dto.offeringId,
            title: dto.title?.trim() || null,
            weekday: dto.weekday,
            startMinute: dto.startMinute,
            endMinute: dto.endMinute,
            timezone: dto.timezone?.trim() || this._configService.getOrThrow<string>('SLOT_DEFAULT_TIMEZONE'),
            slotDurationMinutes: dto.slotDurationMinutes,
            effectiveFrom,
            effectiveUntil,
        });
        try {
            await this._materializeRuleSlots(rule);
        } catch (error) {
            await this._slotRepository.deleteRule(rule.id);
            throw error;
        }
        await this.invalidateAvailabilityCache(profile.id);
        return SlotRuleResponseDto.fromEntity('Availability rule created successfully', rule);
    }

    async updateRule(userId: string, ruleId: string, dto: UpdateSlotRuleDto): Promise<SlotRuleResponseDto> {
        const profile = await this._instructorService.findApprovedProfileByUserId(userId);
        if (!profile) {
            throw new NotFoundException('Approved instructor profile not found');
        }
        const existing = await this._slotRepository.findOwnedRule(profile.id, ruleId);
        if (!existing) {
            throw new NotFoundException('Availability rule not found');
        }
        const startMinute = dto.startMinute ?? existing.startMinute;
        const endMinute = dto.endMinute ?? existing.endMinute;
        const duration = dto.slotDurationMinutes ?? existing.slotDurationMinutes;
        const targetStatus = dto.status ?? existing.status;
        this._assertValidMinutes(startMinute, endMinute, duration);
        const effFrom = new Date(existing.effectiveFrom);
        const effectiveUntil = dto.effectiveUntil !== undefined ? (dto.effectiveUntil ? new Date(dto.effectiveUntil) : null) : existing.effectiveUntil;
        if (targetStatus === AvailabilityRuleStatus.ACTIVE) {
            const existingRules = await this._slotRepository.findRulesByWeekday(profile.id, existing.weekday);
            this._validateRuleOverlap(existingRules, ruleId, existing.weekday, startMinute, endMinute, effFrom, effectiveUntil);
        }
        const timeOrDurationChanged = startMinute !== existing.startMinute || endMinute !== existing.endMinute || duration !== existing.slotDurationMinutes;
        const isDeactivating = existing.status === AvailabilityRuleStatus.ACTIVE && targetStatus === AvailabilityRuleStatus.INACTIVE;
        const isActivating = existing.status === AvailabilityRuleStatus.INACTIVE && targetStatus === AvailabilityRuleStatus.ACTIVE;
        if (timeOrDurationChanged || isDeactivating) {
            await this._slotRepository.deleteUnbookedFutureSlotsByRule(ruleId);
        }
        const updated = await this._slotRepository.updateRule(ruleId, {
            title: dto.title === undefined ? undefined : (dto.title?.trim() || null),
            startMinute,
            endMinute,
            slotDurationMinutes: duration,
            effectiveUntil: dto.effectiveUntil === undefined ? undefined : (dto.effectiveUntil ? new Date(dto.effectiveUntil) : null),
            status: targetStatus,
        });
        if (targetStatus === AvailabilityRuleStatus.ACTIVE && (timeOrDurationChanged || isActivating)) {
            await this._materializeRuleSlots(updated);
        }
        await this.invalidateAvailabilityCache(profile.id);
        return SlotRuleResponseDto.fromEntity('Availability rule updated successfully', updated);
    }

    async disableRule(userId: string, ruleId: string): Promise<void> {
        await this.updateRule(userId, ruleId, {
            status: AvailabilityRuleStatus.INACTIVE,
        });
    }

    async deleteRule(userId: string, ruleId: string): Promise<MessageResponseDto> {
        const profile = await this._instructorService.findApprovedProfileByUserId(userId);

        if (!profile) {
            throw new NotFoundException('Approved instructor profile not found');
        }

        const rule = await this._slotRepository.findOwnedRule(profile.id, ruleId);

        if (!rule) {
            throw new NotFoundException('Availability rule not found');
        }

        await this._slotRepository.deleteUnbookedFutureSlotsByRule(ruleId);
        await this._slotRepository.deleteRule(ruleId);
        await this.invalidateAvailabilityCache(profile.id);

        return MessageResponseDto.success('Availability rule deleted successfully');
    }

    async deleteException(userId: string, exceptionId: string): Promise<MessageResponseDto> {
        const profile = await this._instructorService.findApprovedProfileByUserId(userId);

        if (!profile) {
            throw new NotFoundException('Approved instructor profile not found');
        }

        const exception = await this._slotRepository.findOwnedException(profile.id, exceptionId);

        if (!exception) {
            throw new NotFoundException('Availability exception not found');
        }

        if (exception.type === AvailabilityExceptionType.EXTRA) {
            await this._slotRepository.deleteUnbookedSlotsByException(exceptionId);
        }

        await this._slotRepository.deleteException(exceptionId);

        if (exception.type === AvailabilityExceptionType.BLOCK) {
            const activeRules = await this._slotRepository.findActiveRulesByProfile(profile.id);
            for (const rule of activeRules) {
                await this._materializeRuleSlots(rule);
            }
        }

        await this.invalidateAvailabilityCache(profile.id);
        return MessageResponseDto.success('Availability exception deleted successfully');
    }

    async createException(userId: string, dto: CreateSlotExceptionDto): Promise<SlotExceptionResponseDto> {
        const profile = await this._instructorService.findApprovedProfileByUserId(userId);

        if (!profile) {
            throw new NotFoundException('Approved instructor profile not found');
        }

        const startTime = new Date(dto.startTime);
        const endTime = new Date(dto.endTime);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new BadRequestException('Please provide valid start and end dates');
        }

        if (endTime <= startTime) {
            throw new BadRequestException('End time must be after start time');
        }

        if (dto.type === AvailabilityExceptionType.EXTRA) {
            if (startTime <= new Date()) {
                throw new BadRequestException('Start time must be in the future');
            }
            if (!dto.offeringId) {
                throw new BadRequestException('Extra availability requires an offering');
            }
            if (!dto.slotDurationMinutes) {
                throw new BadRequestException('Extra availability requires slot duration');
            }

            const existingBlock = await this._slotRepository.findOverlappingBlockException({
                profileId: profile.id,
                startTime,
                endTime,
            });

            if (existingBlock) {
                throw new ConflictException(
                    'Cannot add extra availability during an active time off block. Please remove the time block first.',
                );
            }

            const overlappingSlots = await this._slotRepository.findActiveSlotsInRange({
                profileId: profile.id,
                from: startTime,
                to: endTime,
            });

            if (overlappingSlots.length > 0) {
                const booked = overlappingSlots.find((s) => s.status === SlotStatus.BOOKED);
                if (booked) {
                    throw new ConflictException(
                        'This time window overlaps with an already booked session with a student.',
                    );
                }

                const fromRule = overlappingSlots.find((s) => s.ruleId);
                if (fromRule) {
                    throw new ConflictException(
                        'This time window overlaps with slots already generated by your weekly recurring schedule. You do not need to add extra hours for times already covered by your schedule. If you wish to change hours on this day, pause or edit your weekly rule first.',
                    );
                }

                throw new ConflictException(
                    'This time window overlaps with an existing availability slot on your schedule.',
                );
            }
        }

        if (dto.type === AvailabilityExceptionType.BLOCK) {
            if (endTime <= new Date()) {
                throw new BadRequestException('Block end time must be in the future');
            }

            const existingBlock = await this._slotRepository.findOverlappingBlockException({
                profileId: profile.id,
                offeringId: dto.offeringId,
                startTime,
                endTime,
            });

            if (existingBlock) {
                throw new ConflictException(
                    'This time window is already blocked (or overlaps an existing time block)',
                );
            }
        }

        if (dto.offeringId) {
            await this._instructorService.findApprovedOfferingForProfile(profile.id, dto.offeringId);
        }

        const exception = await this._slotRepository.createException({
            profileId: profile.id,
            offeringId: dto.offeringId ?? null,
            type: dto.type,
            title: dto.title?.trim() || null,
            startTime,
            endTime,
            timezone: dto.timezone?.trim() || this._configService.getOrThrow<string>('SLOT_DEFAULT_TIMEZONE'),
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
                timezone: dto.timezone?.trim() || this._configService.getOrThrow<string>('SLOT_DEFAULT_TIMEZONE'),
                durationMinutes: dto.slotDurationMinutes!,
            });

            await this._slotRepository.createSlots(slots);
        }

        await this.invalidateAvailabilityCache(profile.id);
        return SlotExceptionResponseDto.fromEntity('Availability exception created successfully', exception);
    }

    async getPublicAvailability(profileId: string, query: SlotAvailabilityQueryDto): Promise<PublicSlotListResponseDto> {
        const range = this._rangeFromQuery({
            offeringId: query.offeringId,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        });

        const cacheKey = `availability:${profileId}:${query.offeringId ?? 'all'}:${range.from.toISOString()}:${range.to.toISOString()}`;
        const indexKey = `availability:index:${profileId}`;

        try {
            const cached = await this._redisService.get(cacheKey);
            if (cached) {
                this._logger.log(`Cache HIT for public availability: ${cacheKey}`, SlotService.name);
                return JSON.parse(cached) as PublicSlotListResponseDto;
            }
            this._logger.log(`Cache MISS for public availability: ${cacheKey}`, SlotService.name);
        } catch (err) {
            this._logger.warn(
                `Redis cache read failed for ${cacheKey}: ${err instanceof Error ? err.message : String(err)}`,
                SlotService.name,
            );
        }

        const slots = await this._slotRepository.findPublicSlots({
            profileId,
            offeringId: query.offeringId,
            from: range.from,
            to: range.to,
        });

        const snapshots = await this._instructorService.getOfferingSnapshots(
            [...new Set(slots.map((s) => s.offeringId))],
        );
        const byId = new Map(snapshots.map((o) => [o.id, o]));

        const filtered = slots.filter((s) => {
            const o = byId.get(s.offeringId);
            return o?.profileStatus === InstructorProfileStatus.APPROVED
                && o.status === OfferingStatus.APPROVED;
        })
            .map((s) => {
                const o = byId.get(s.offeringId)!;
                return {
                    ...s,
                    offering: { id: o.id, title: o.title, subcategory: o.subcategory },
                };
            });

        const response = PublicSlotListResponseDto.fromEntities('Public availability fetched successfully', filtered);

        try {
            await this._redisService.set(cacheKey, JSON.stringify(response), 600);
            await this._redisService.sadd(indexKey, cacheKey, 600);
        } catch (err) {
            this._logger.warn(
                `Redis cache write failed for ${cacheKey}: ${err instanceof Error ? err.message : String(err)}`,
                SlotService.name,
            );
        }

        return response;
    }

    async invalidateAvailabilityCache(profileId: string): Promise<void> {
        try {
            const indexKey = `availability:index:${profileId}`;
            const cachedKeys = await this._redisService.smembers(indexKey);
            if (cachedKeys && cachedKeys.length > 0) {
                await this._redisService.del(...cachedKeys, indexKey);
                this._logger.log(
                    `Invalidated ${cachedKeys.length} availability cache entries for instructor profile: ${profileId}`,
                    SlotService.name,
                );
            } else {
                await this._redisService.del(indexKey);
            }
        } catch (err) {
            this._logger.warn(
                `Failed to invalidate availability cache for instructor profile ${profileId}: ${err instanceof Error ? err.message : String(err)}`,
                SlotService.name,
            );
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
        generationEnd.setDate(generationEnd.getDate() + this._configService.getOrThrow<number>('SLOT_GENERATION_DAYS'));

        const effectiveFrom = new Date(rule.effectiveFrom);
        const effectiveUntil = rule.effectiveUntil ? new Date(rule.effectiveUntil) : generationEnd;

        const end = effectiveUntil < generationEnd ? effectiveUntil : generationEnd;
        const now = new Date();
        const cursor = new Date(effectiveFrom > now ? effectiveFrom : now);

        const blockExceptions = await this._slotRepository.findActiveBlockExceptionsInRange({
            profileId: rule.profileId,
            offeringId: rule.offeringId,
            from: now,
            to: end,
        });

        const slots: CreateSlotInput[] = [];
        const WEEKDAY_MAP: Record<string, number> = {
            Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
        };

        while (cursor <= end) {
            const weekdayStr = new Intl.DateTimeFormat('en-US', {
                timeZone: rule.timezone,
                weekday: 'short',
            }).format(cursor);
            const cursorWeekday = WEEKDAY_MAP[weekdayStr];

            if (cursorWeekday === rule.weekday) {
                const dateKey = new Intl.DateTimeFormat('en-CA', {
                    timeZone: rule.timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }).format(cursor);
                const dayStart = this._dateFromMinute(dateKey, rule.startMinute, rule.timezone);
                const dayEnd = this._dateFromMinute(dateKey, rule.endMinute, rule.timezone);

                const daySlots = this._splitRangeIntoSlots({
                    profileId: rule.profileId,
                    offeringId: rule.offeringId,
                    ruleId: rule.id,
                    title: rule.title,
                    startTime: dayStart,
                    endTime: dayEnd,
                    timezone: rule.timezone,
                    durationMinutes: rule.slotDurationMinutes,
                }).filter((s) => {
                    if (s.startTime <= now) return false;
                    const isBlocked = blockExceptions.some(
                        (b) => s.startTime < b.endTime && s.endTime > b.startTime,
                    );
                    return !isBlocked;
                });

                slots.push(...daySlots);
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        try {
            await this._slotRepository.createSlots(slots);
        } catch {
            throw new ConflictException('Availability overlaps existing slots');
        }
    }

    private _validateRuleOverlap(
        existingRules: SlotRuleEntity[],
        targetRuleId: string | null,
        weekday: number,
        startMinute: number,
        endMinute: number,
        effectiveFrom: Date,
        effectiveUntil: Date | null,
    ) {
        const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdayName = WEEKDAY_NAMES[weekday] ?? `Day ${weekday}`;

        for (const existing of existingRules) {
            if (targetRuleId && existing.id === targetRuleId) continue;
            if (existing.status !== AvailabilityRuleStatus.ACTIVE) continue;
            if (existing.weekday !== weekday) continue;

            const existEffFrom = new Date(existing.effectiveFrom);
            const existEffUntil = existing.effectiveUntil ? new Date(existing.effectiveUntil) : null;

            const dateRangesOverlap =
                (!effectiveUntil || existEffFrom <= effectiveUntil) &&
                (!existEffUntil || effectiveFrom <= existEffUntil);

            if (dateRangesOverlap) {
                if (startMinute < existing.endMinute && endMinute > existing.startMinute) {
                    const startStr = this._minuteTo12Hour(existing.startMinute);
                    const endStr = this._minuteTo12Hour(existing.endMinute);
                    throw new ConflictException(
                        `Weekly rule overlaps an existing active schedule on ${weekdayName} (${startStr} – ${endStr}). Please choose a different time window.`
                    );
                }
            }
        }
    }

    private _minuteTo12Hour(minute: number): string {
        const hour24 = Math.floor(minute / 60);
        const mins = minute % 60;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        const minsFormatted = mins.toString().padStart(2, '0');
        return `${hour12}:${minsFormatted} ${period}`;
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
    }): CreateSlotInput[] {
        const slots: CreateSlotInput[] = [];
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

    private _dateFromMinute(date: string, minute: number, timezone: string) {
        const hours = Math.floor(minute / 60).toString().padStart(2, '0');
        const mins = (minute % 60).toString().padStart(2, '0');

        const localDateString = `${date}T${hours}:${mins}:00`;

        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'shortOffset',
        });

        // This will extract the offset string like "GMT+5:30" or "GMT-4"

        const parts = formatter.formatToParts(new Date(localDateString + 'Z'));
        const offsetPart = parts.find(p => p.type === 'timeZoneName')?.value || 'GMT';

        // Convert "GMT+5:30" to "+05:30" format for the ISO string

        let offset = offsetPart.replace('GMT', '');
        if (!offset) offset = 'Z';
        else if (!offset.includes(':')) offset += ':00'; // Handle exact hour offsets like "+5" -> "+5:00"

        if (offset.length === 5 && offset !== 'Z') offset = offset.slice(0, 1) + '0' + offset.slice(1); // "+5:30" -> "+05:30"

        return new Date(`${localDateString}${offset}`)
    }

    private _rangeFromQuery(query: SlotAvailabilityQueryInput) {
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