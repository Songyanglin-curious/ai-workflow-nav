import { z } from 'zod';

export const startupCheckTypeValues = [
  'CONFIG_READABLE',
  'CONFIG_VALID',
  'WORKSPACE_ROOT_VALID',
  'FIXED_DIRECTORIES_READY',
  'RUNTIME_DB_READY',
  'SCHEMA_EXECUTED',
] as const;
export const startupCheckTypeSchema = z.enum(startupCheckTypeValues);
export type StartupCheckType = z.infer<typeof startupCheckTypeSchema>;

export const startupCheckStatusValues = ['passed', 'failed', 'fixed'] as const;
export const startupCheckStatusSchema = z.enum(startupCheckStatusValues);
export type StartupCheckStatus = z.infer<typeof startupCheckStatusSchema>;

export const startupStatusValues = ['ready', 'failed'] as const;
export const startupStatusSchema = z.enum(startupStatusValues);
export type StartupStatus = z.infer<typeof startupStatusSchema>;

export const startupCheckItemSchema = z.object({
  checkType: startupCheckTypeSchema,
  status: startupCheckStatusSchema,
  message: z.string(),
});
export type StartupCheckItem = z.infer<typeof startupCheckItemSchema>;

export const startupReportSchema = z.object({
  startupStatus: startupStatusSchema,
  checks: z.array(startupCheckItemSchema),
});
export type StartupReport = z.infer<typeof startupReportSchema>;

export const selfCheckResultSchema = z.object({
  status: startupStatusSchema,
  checks: z.array(startupCheckItemSchema),
});
export type SelfCheckResult = z.infer<typeof selfCheckResultSchema>;
