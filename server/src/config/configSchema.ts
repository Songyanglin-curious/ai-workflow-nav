import { z } from 'zod';

export const configSchema = z.object({
  server: z.object({
    host: z.string().min(1),
    port: z.number().int().positive(),
  }),
  workspace: z.object({
    root: z.string().min(1),
  }),
  database: z.object({
    path: z.string().min(1),
  }),
  promptsProject: z
    .object({
      root: z.string().min(1),
    })
    .optional(),
  tools: z
    .object({
      fileOpener: z
        .object({
          kind: z.string().min(1),
          command: z.string().min(1),
          args: z.array(z.string()),
        })
        .optional(),
    })
    .optional(),
});

export type AppConfig = z.infer<typeof configSchema>;
