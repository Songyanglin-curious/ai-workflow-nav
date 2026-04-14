import { z } from 'zod';

export const testEchoBodySchema = z.object({
  message: z.string().min(1),
});

export const testStatusSchema = z.object({
  module: z.literal('test'),
  ok: z.literal(true),
});

export const testEchoResponseSchema = z.object({
  echoed: z.string(),
});

export const testResolvePathBodySchema = z.object({
  relativePath: z.string().min(1),
});

export const testResolvePathResponseSchema = z.object({
  relativePath: z.string(),
  absolutePath: z.string(),
});

export type TestEchoBody = z.infer<typeof testEchoBodySchema>;
export type TestResolvePathBody = z.infer<typeof testResolvePathBodySchema>;
