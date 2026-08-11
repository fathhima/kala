export class SubcategoryEntity {
    id!: string;
    categoryId!: string;
    name!: string;
    slug!: string;
    description?: string | null;
    imageUrl?: string | null;
    imageStorageKey?: string | null;
    isActive!: boolean;
    sortOrder!: number;
    createdAt!: Date;
    updatedAt!: Date;
}