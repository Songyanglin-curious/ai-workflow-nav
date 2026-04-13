import type { ZodType } from 'zod';
import { z } from 'zod';

export const uuidParamSchema = z.string().uuid();
export const optionalStringSchema = z.string().optional();
export const trimmedStringSchema = z.string().trim();
export const nonEmptyStringSchema = trimmedStringSchema.min(1);
export const descriptionSchema = z.string();
export const tagsSchema = z.string();
export const categorySchema = z.string();
export const emptyObjectSchema = z.object({}).strict();

export function parseInput<T>(schema: ZodType<T>, input: unknown): T {
  return schema.parse(input);
}
