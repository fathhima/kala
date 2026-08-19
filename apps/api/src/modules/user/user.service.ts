import { Inject, Injectable } from "@nestjs/common";
import { CATEGORY_REPOSITORY, type CategoryRepository } from "../category/repositories/interfaces/category.repository";
import { CategoryEntity } from "../category/entities/category.entity";

@Injectable()
export class UserService {
    constructor(@Inject(CATEGORY_REPOSITORY)
    private readonly categoryRepository: CategoryRepository) { }

    async findSelectable(): Promise<CategoryEntity[]> {
        return this.categoryRepository.findSelectable()
    }
}