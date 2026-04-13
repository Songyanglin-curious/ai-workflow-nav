import { createItemsDataSchema, createNamedDataSchema, createResultDataSchema } from '../common/index.js';
import { appendLatestDeliberationsResultSchema, createDeliberationsFileResultSchema, deliberationsRecordFileItemSchema, deliberationsRecordFolderInfoSchema, } from './dto.js';
export const deliberationsRecordFolderDataSchema = createNamedDataSchema('deliberationsRecord', deliberationsRecordFolderInfoSchema);
export const deliberationsRecordFilesDataSchema = createItemsDataSchema(deliberationsRecordFileItemSchema);
export const appendLatestDeliberationsDataSchema = createResultDataSchema(appendLatestDeliberationsResultSchema);
export const createDeliberationsFileDataSchema = createResultDataSchema(createDeliberationsFileResultSchema);
//# sourceMappingURL=responses.js.map