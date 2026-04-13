import { z } from 'zod';

import { createResultDataSchema } from '../common/index.js';
import { inspectionRunResultSchema } from './dto.js';

export const inspectionRunDataSchema = createResultDataSchema(inspectionRunResultSchema);
export type InspectionRunData = z.infer<typeof inspectionRunDataSchema>;
