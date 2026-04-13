function mapSummaryRecordRow(row) {
    return {
        id: row.id,
        projectNodeId: row.project_node_id,
        folderPath: row.folder_path,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export function createSummaryRecord(projectNodeId, folderPath, timestamp, id) {
    return {
        id,
        projectNodeId,
        folderPath,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}
export function createSummaryRepo(database) {
    return {
        getSummaryRecordByProjectNodeId(projectNodeId) {
            const statement = database.prepare(`
        SELECT
          id,
          project_node_id,
          folder_path,
          created_at,
          updated_at
        FROM summary_records
        WHERE project_node_id = @projectNodeId
      `);
            const row = statement.get({ projectNodeId });
            return row ? mapSummaryRecordRow(row) : undefined;
        },
        createSummaryRecord(record) {
            const statement = database.prepare(`
        INSERT INTO summary_records (
          id,
          project_node_id,
          folder_path,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @projectNodeId,
          @folderPath,
          @createdAt,
          @updatedAt
        )
      `);
            statement.run({
                id: record.id,
                projectNodeId: record.projectNodeId,
                folderPath: record.folderPath,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            });
            return record;
        },
    };
}
//# sourceMappingURL=repo.js.map