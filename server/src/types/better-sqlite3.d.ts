declare module 'better-sqlite3' {
  interface DatabaseConstructorOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
  }

  interface TransactionFunction<TResult> {
    (): TResult;
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  interface Statement<TResult = unknown> {
    all(parameters?: unknown[] | Record<string, unknown>): TResult[];
    get(parameters?: unknown[] | Record<string, unknown>): TResult | undefined;
    run(parameters?: unknown[] | Record<string, unknown>): RunResult;
  }

  interface Database {
    pragma(source: string): unknown;
    exec(source: string): this;
    close(): void;
    transaction<TResult>(execute: () => TResult): TransactionFunction<TResult>;
    prepare<TResult = unknown>(source: string): Statement<TResult>;
  }

  interface DatabaseConstructor {
    new (filename: string, options?: DatabaseConstructorOptions): Database;
  }

  const Database: DatabaseConstructor;

  export default Database;
}
