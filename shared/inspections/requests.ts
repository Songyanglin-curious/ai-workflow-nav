import { z } from 'zod';

import { emptyBodySchema } from '../common/index.js';

export const inspectionRunRequestSchema = emptyBodySchema;
export type InspectionRunRequest = z.infer<typeof inspectionRunRequestSchema>;
