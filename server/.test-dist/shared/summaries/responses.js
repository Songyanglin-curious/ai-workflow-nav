import { createItemsDataSchema, createNamedDataSchema } from '../common/index.js';
import { summaryFileItemSchema, summaryFolderInfoSchema } from './dto.js';
export const summaryFolderDataSchema = createNamedDataSchema('summary', summaryFolderInfoSchema);
export const summaryFilesDataSchema = createItemsDataSchema(summaryFileItemSchema);
//# sourceMappingURL=responses.js.map