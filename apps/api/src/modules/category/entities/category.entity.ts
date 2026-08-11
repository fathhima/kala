import { SubcategoryEntity } from './subcategory.entity';

export class CategoryEntity {
    id!: string;
    name!: string;
    slug!: string;
    description?: string | null;
    imageUrl?: string | null;
    imageStorageKey?: string | null;
    isActive!: boolean;
    sortOrder!: number;
    createdAt!: Date;
    updatedAt!: Date;
    subcategories!: SubcategoryEntity[];
}