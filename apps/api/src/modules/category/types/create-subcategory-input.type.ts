export type CreateSubcategoryInput = {
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
};