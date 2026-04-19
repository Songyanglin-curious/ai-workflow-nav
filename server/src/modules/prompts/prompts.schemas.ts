import { z } from 'zod';

export const promptRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  contentFilePath: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const queryPromptListBodySchema = z.object({
  keyword: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
});

export const queryPromptListResponseSchema = z.object({
  items: z.array(promptRecordSchema),
});

export const queryPromptDetailBodySchema = z.object({
  id: z.string().min(1),
});

export const queryPromptDetailResponseSchema = promptRecordSchema;

export type QueryPromptListBody = z.infer<typeof queryPromptListBodySchema>;
export type QueryPromptDetailBody = z.infer<typeof queryPromptDetailBodySchema>;
