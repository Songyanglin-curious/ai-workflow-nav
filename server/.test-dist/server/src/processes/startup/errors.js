export class StartupBlockedError extends Error {
    code = 'INTERNAL_ERROR';
    constructor(message) {
        super(message);
        this.name = 'StartupBlockedError';
    }
}
//# sourceMappingURL=errors.js.map