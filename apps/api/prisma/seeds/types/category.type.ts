import { SeedSubcategory } from "./sub-category.type";

export type SeedCategory = {
    name: string;
    slug: string;
    description: string;
    sortOrder: number;
    subcategories: SeedSubcategory[];
};