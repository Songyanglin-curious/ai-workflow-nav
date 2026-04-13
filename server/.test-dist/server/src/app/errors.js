export class AppBootstrapError extends Error {
    constructor(cause) {
        super('应用启动失败。', { cause });
        this.name = 'AppBootstrapError';
    }
}
//# sourceMappingURL=errors.js.map