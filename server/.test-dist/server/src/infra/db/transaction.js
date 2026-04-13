import { DatabaseTransactionError } from './errors.js';
export function runInTransaction(database, execute) {
    const transaction = database.transaction(() => execute(database));
    try {
        return transaction();
    }
    catch (error) {
        throw new DatabaseTransactionError(error);
    }
}
//# sourceMappingURL=transaction.js.map