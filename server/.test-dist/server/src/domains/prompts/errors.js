export class PromptNotFoundError extends Error {
    code = 'PROMPT_NOT_FOUND';
    constructor(promptId) {
        super(`Prompt 不存在：${promptId}`);
        this.name = 'PromptNotFoundError';
    }
}
export class PromptFilePathConflictError extends Error {
    code = 'PROMPT_FILE_PATH_CONFLICT';
    constructor(filePath) {
        super(`Prompt 正文文件路径冲突：${filePath}`);
        this.name = 'PromptFilePathConflictError';
    }
}
export class PromptValidationFailedError extends Error {
    code = 'PROMPT_VALIDATION_FAILED';
    constructor(message) {
        super(message);
        this.name = 'PromptValidationFailedError';
    }
}
export class PromptFileMissingError extends Error {
    code = 'PROMPT_FILE_MISSING';
    constructor(filePath) {
        super(`Prompt 正文文件缺失：${filePath}`);
        this.name = 'PromptFileMissingError';
    }
}
//# sourceMappingURL=errors.js.map