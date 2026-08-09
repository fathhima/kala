export type CreateCategoryInput = {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    sortOrder: number;
};