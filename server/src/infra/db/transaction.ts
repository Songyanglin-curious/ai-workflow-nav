import type { SqliteDatabase } from './client.js';
import { DatabaseTransactionError } from './errors.js';

export function runInTransaction<TResult>(
  database: SqliteDatabase,
  execute: (database: SqliteDatabase) => TResult,
): TResult {
  const transaction = database.transaction(() => execute(database));

  try {
    return transaction();
  } catch (error) {
    throw new DatabaseTransactionError(error);
  }
}
