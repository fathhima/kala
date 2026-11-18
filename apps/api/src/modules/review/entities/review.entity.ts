export class ReviewStudentEntity {
    id!: string;
    name!: string;
    imageUrl!: string | null;
}

export class ReviewEntity {
    id!: string;
    bookingId!: string;
    studentId!: string;
    profileId!: string;
    rating!: number;
    comment!: string | null;
    createdAt!: Date;
    updatedAt!: Date;
    student!: ReviewStudentEntity;
}

export class PaginatedReviewEntity {
    items!: ReviewEntity[];
    page!: number;
    limit!: number;
    total!: number;
}

export class ReviewDistributionEntity {
    5!: number;
    4!: number;
    3!: number;
    2!: number;
    1!: number;
}

export class InstructorReviewSummaryEntity {
    averageRating!: number;
    totalReviews!: number;
    distribution!: ReviewDistributionEntity;
}
