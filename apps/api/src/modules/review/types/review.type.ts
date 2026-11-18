export type CreateReviewInput = {
    bookingId: string;
    studentId: string;
    profileId: string;
    rating: number;
    comment?: string;
};

export type ReviewListQuery = {
    page: number;
    limit: number;
    rating?: number;
};
