import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof uuidSchema>;

export const isoDateTimeSchema = z.string().datetime({ offset: true });
export type IsoDateTime = z.infer<typeof isoDateTimeSchema>;

export const textSchema = z.string();
export type Text = z.infer<typeof textSchema>;

export const trimmedNonEmptyStringSchema = z.string().trim().min(1);
export type TrimmedNonEmptyString = z.infer<typeof trimmedNonEmptyStringSchema>;

export const descriptionSchema = z.string();
export type Description = z.infer<typeof descriptionSchema>;

export const tagsSchema = z.string();
export type Tags = z.infer<typeof tagsSchema>;

export const categorySchema = z.string();
export type Category = z.infer<typeof categorySchema>;

export const sortOrderSchema = z.number().int();
export type SortOrder = z.infer<typeof sortOrderSchema>;

export const integerSchema = z.number().int();
export type Integer = z.infer<typeof integerSchema>;
