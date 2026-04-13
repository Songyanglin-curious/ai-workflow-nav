export class DatabaseOpenError extends Error {
  constructor(databasePath: string, cause: unknown) {
    super(`无法打开数据库文件：${databasePath}`, { cause });
    this.name = 'DatabaseOpenError';
  }
}

export class DatabaseTransactionError extends Error {
  constructor(cause: unknown) {
    super('数据库事务执行失败。', { cause });
    this.name = 'DatabaseTransactionError';
  }
}

export class DatabaseMigrationError extends Error {
  constructor(schemaPath: string, cause: unknown) {
    super(`数据库 schema 执行失败：${schemaPath}`, { cause });
    this.name = 'DatabaseMigrationError';
  }
}
