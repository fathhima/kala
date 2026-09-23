import { InstructorProfileStatus, OfferingStatus } from "../enums/instructor.enum";

export type OfferingSnapshot = {
    id: string;
    title: string | null;
    status: OfferingStatus;
    profileId: string;
    profileStatus: InstructorProfileStatus;
    subcategory: { id: string; name: string };
};