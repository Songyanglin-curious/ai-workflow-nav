export class DatabaseOpenError extends Error {
    constructor(databasePath, cause) {
        super(`无法打开数据库文件：${databasePath}`, { cause });
        this.name = 'DatabaseOpenError';
    }
}
export class DatabaseTransactionError extends Error {
    constructor(cause) {
        super('数据库事务执行失败。', { cause });
        this.name = 'DatabaseTransactionError';
    }
}
export class DatabaseMigrationError extends Error {
    constructor(schemaPath, cause) {
        super(`数据库 schema 执行失败：${schemaPath}`, { cause });
        this.name = 'DatabaseMigrationError';
    }
}
//# sourceMappingURL=errors.js.map