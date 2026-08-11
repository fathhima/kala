import { CategoryFormValues } from "./create-category-form-values.type";

export type UpdateCategoryFormValues = CategoryFormValues & { isActive?: boolean }