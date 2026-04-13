export class ImportsExportsValidationError extends Error {
    code = 'VALIDATION_ERROR';
    constructor(message) {
        super(message);
        this.name = 'ImportsExportsValidationError';
    }
}
export class ImportsExportsInternalError extends Error {
    code = 'INTERNAL_ERROR';
    constructor(message, cause) {
        super(message, { cause });
        this.name = 'ImportsExportsInternalError';
    }
}
//# sourceMappingURL=errors.js.map