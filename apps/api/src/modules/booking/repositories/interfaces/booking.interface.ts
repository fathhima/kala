import {
  BookingEntity,
  PaginatedBookingEntity,
} from '../../entities/booking.entity';
import {
  BookingListQuery,
  CancelBookingInput,
  CompleteBookingInput,
  ConfirmBookingInput,
  CreateBookingInput,
} from '../../types/booking.type';
import { IBaseRepository, TransactionClient } from '@/shared/prisma/base';

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');

export interface IBookingRepository extends IBaseRepository<BookingEntity> {
  holdSlot(
    input: CreateBookingInput,
    holdTtlSeconds: number,
    tx?: TransactionClient,
  ): Promise<BookingEntity>;

  findById(id: string, tx?: TransactionClient): Promise<BookingEntity | null>;

  exists(id: string, tx?: TransactionClient): Promise<boolean>;

  findStudentBookings(
    studentId: string,
    query: BookingListQuery,
    tx?: TransactionClient,
  ): Promise<PaginatedBookingEntity>;

  findInstructorBookings(
    profileId: string,
    query: BookingListQuery,
    tx?: TransactionClient,
  ): Promise<PaginatedBookingEntity>;

  findAdminBookings(
    query: BookingListQuery,
    tx?: TransactionClient,
  ): Promise<PaginatedBookingEntity>;

  findManyForAdmin(
    query: BookingListQuery,
    tx?: TransactionClient,
  ): Promise<PaginatedBookingEntity>;

  findApprovedProfileIdByUserId(
    userId: string,
    tx?: TransactionClient,
  ): Promise<string | null>;

  cancelBooking(
    input: CancelBookingInput,
    tx?: TransactionClient,
  ): Promise<BookingEntity>;

  completeBooking(
    input: CompleteBookingInput,
    tx?: TransactionClient,
  ): Promise<BookingEntity>;

  expireHolds(tx?: TransactionClient): Promise<number>;
}
