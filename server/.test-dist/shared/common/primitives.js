import { z } from 'zod';
export const uuidSchema = z.string().uuid();
export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const textSchema = z.string();
export const trimmedNonEmptyStringSchema = z.string().trim().min(1);
export const descriptionSchema = z.string();
export const tagsSchema = z.string();
export const categorySchema = z.string();
export const sortOrderSchema = z.number().int();
export const integerSchema = z.number().int();
//# sourceMappingURL=primitives.js.map