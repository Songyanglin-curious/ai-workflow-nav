import { z } from 'zod';

import { emptyBodySchema } from '../common/index.js';

export const selfCheckRequestSchema = emptyBodySchema;
export type SelfCheckRequest = z.infer<typeof selfCheckRequestSchema>;
