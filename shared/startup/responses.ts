import { z } from 'zod';

import { createNamedDataSchema, createResultDataSchema } from '../common/index.js';
import { selfCheckResultSchema, startupReportSchema } from './dto.js';

export const startupReportDataSchema = createNamedDataSchema('report', startupReportSchema);
export type StartupReportData = z.infer<typeof startupReportDataSchema>;

export const selfCheckDataSchema = createResultDataSchema(selfCheckResultSchema);
export type SelfCheckData = z.infer<typeof selfCheckDataSchema>;
