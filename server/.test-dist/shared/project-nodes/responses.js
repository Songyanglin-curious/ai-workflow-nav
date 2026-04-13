import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema } from '../common/index.js';
import { projectNodeDeletionCheckResultSchema, projectNodeDeletionExecuteResultSchema, projectNodeDetailSchema, projectNodeSummarySchema, } from './dto.js';
export const projectNodesListDataSchema = createItemsDataSchema(projectNodeSummarySchema);
export const projectNodeDetailDataSchema = createNamedDataSchema('projectNode', projectNodeDetailSchema);
export const projectNodeDeletionCheckDataSchema = createResultDataSchema(projectNodeDeletionCheckResultSchema);
export const projectNodeDeletionExecuteDataSchema = createResultDataSchema(projectNodeDeletionExecuteResultSchema);
//# sourceMappingURL=responses.js.map