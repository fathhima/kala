export const INSTRUCTOR_QUERY = Symbol('INSTRUCTOR_QUERY');

export interface IInstructorQuery {
    findApprovedProfileIdByUserId(userId: string): Promise<{ id: string } | null>;

    findApprovedOfferingId(profileId: string, offeringId: string): Promise<{ id: string } | null>;
}