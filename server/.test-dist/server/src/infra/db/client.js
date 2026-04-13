import BetterSqlite3 from 'better-sqlite3';
import { DatabaseOpenError } from './errors.js';
export function openDatabase(options) {
    const { databasePath, readonly = false, fileMustExist = false } = options;
    try {
        const database = new BetterSqlite3(databasePath, {
            readonly,
            fileMustExist,
        });
        database.pragma('foreign_keys = ON');
        if (!readonly) {
            database.pragma('journal_mode = WAL');
        }
        return database;
    }
    catch (error) {
        throw new DatabaseOpenError(databasePath, error);
    }
}
export function closeDatabase(database) {
    database.close();
}
//# sourceMappingURL=client.js.map