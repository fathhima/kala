import { z } from 'zod'

export type ValidationErrors<T extends string> = Partial<Record<T, string>>

export const getValidationErrors = <T extends string>(result: z.ZodSafeParseResult<unknown>,): ValidationErrors<T> => {
  if (result.success) {
    return {}
  }

  const errors: ValidationErrors<T> = {}

  for (const issue of result.error.issues) {
    const field = issue.path[0]

    if (typeof field !== 'string') {
      continue
    }

    if (!errors[field as T]) {
      errors[field as T] = issue.message
    }
  }

  return errors
}