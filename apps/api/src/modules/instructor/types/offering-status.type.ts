import type { OfferingStatus } from '@prisma/client';

export const REVIEWABLE_OFFERING_STATUSES = ['APPROVED', 'REJECTED', 'CHANGES_REQUESTED',] as const;

export type ReviewableOfferingStatus = Extract<OfferingStatus, (typeof REVIEWABLE_OFFERING_STATUSES)[number]>;

export const EDITABLE_OFFERING_STATUSES = ['DRAFT', 'REJECTED', 'CHANGES_REQUESTED',] as const;

export type EditableOfferingStatus = Extract<OfferingStatus, (typeof EDITABLE_OFFERING_STATUSES)[number]>;

export const isEditableOfferingStatus = (status: OfferingStatus,): status is EditableOfferingStatus => {
  return EDITABLE_OFFERING_STATUSES.some((editableStatus) => editableStatus === status,);
};