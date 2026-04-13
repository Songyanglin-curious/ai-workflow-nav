import { z } from 'zod';

export const commonErrorCodeValues = [
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'PRECONDITION_FAILED',
  'INTERNAL_ERROR',
] as const;

export const commonErrorCodeSchema = z.enum(commonErrorCodeValues);
export type CommonErrorCode = z.infer<typeof commonErrorCodeSchema>;

export const validationIssueSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string().optional(),
});
export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export const errorDetailsSchema = z.record(z.string(), z.unknown());
export type ErrorDetails = z.infer<typeof errorDetailsSchema>;

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: errorDetailsSchema.optional(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;
