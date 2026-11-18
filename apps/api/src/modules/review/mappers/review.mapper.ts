import { ReviewEntity } from '../entities/review.entity';

export const reviewInclude = {
    student: {
        select: {
            id: true,
            name: true,
            imageUrl: true,
        },
    },
};

export type ReviewRecord = {
    id: string;
    bookingId: string;
    studentId: string;
    profileId: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
    student: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
};

export class ReviewMapper {
    static toEntity(record: ReviewRecord): ReviewEntity {
        const entity = new ReviewEntity();
        entity.id = record.id;
        entity.bookingId = record.bookingId;
        entity.studentId = record.studentId;
        entity.profileId = record.profileId;
        entity.rating = record.rating;
        entity.comment = record.comment;
        entity.createdAt = record.createdAt;
        entity.updatedAt = record.updatedAt;
        entity.student = {
            id: record.student.id,
            name: record.student.name,
            imageUrl: record.student.imageUrl,
        };
        return entity;
    }
}
