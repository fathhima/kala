import { CategoryFormValues } from "./create-category-form-values.type";

export type UpdateSubcategoryFormValues = CategoryFormValues & { isActive?: boolean }