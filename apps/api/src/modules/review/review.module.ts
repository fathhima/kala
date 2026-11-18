import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { ReviewController } from './review.controller';
import { ReviewService } from './services/review.service';
import { REVIEW_SERVICE } from './services/interfaces/review.service.interface';
import { PrismaReviewRepository } from './repositories/prisma-review.repository';
import { REVIEW_REPOSITORY } from './repositories/interfaces/review.interface';

@Module({
    imports: [PrismaModule],
    controllers: [ReviewController],
    providers: [
        {
            provide: REVIEW_SERVICE,
            useClass: ReviewService,
        },
        PrismaReviewRepository,
        {
            provide: REVIEW_REPOSITORY,
            useExisting: PrismaReviewRepository,
        },
    ],
    exports: [REVIEW_SERVICE, REVIEW_REPOSITORY],
})
export class ReviewModule { }
