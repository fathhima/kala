export type UpdateCategoryInput = {
    name?: string;
    slug?: string;
    description?: string | null;
    imageUrl?: string | null;
    imageStorageKey?: string | null;
    isActive?: boolean;
    sortOrder?: number;
};