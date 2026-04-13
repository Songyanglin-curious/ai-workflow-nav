import { z } from 'zod';
export const commonErrorCodeValues = [
    'VALIDATION_ERROR',
    'NOT_FOUND',
    'CONFLICT',
    'PRECONDITION_FAILED',
    'INTERNAL_ERROR',
];
export const commonErrorCodeSchema = z.enum(commonErrorCodeValues);
export const validationIssueSchema = z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional(),
});
export const errorDetailsSchema = z.record(z.string(), z.unknown());
export const apiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: errorDetailsSchema.optional(),
});
//# sourceMappingURL=errors.js.map