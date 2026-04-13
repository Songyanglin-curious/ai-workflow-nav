function mapDeliberationsRecordRow(row) {
    return {
        id: row.id,
        projectNodeId: row.project_node_id,
        folderPath: row.folder_path,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export function createDeliberationsRecord(projectNodeId, folderPath, timestamp, id) {
    return {
        id,
        projectNodeId,
        folderPath,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}
export function createDeliberationsRepo(database) {
    return {
        getDeliberationsRecordByProjectNodeId(projectNodeId) {
            const statement = database.prepare(`
        SELECT
          id,
          project_node_id,
          folder_path,
          created_at,
          updated_at
        FROM deliberations_records
        WHERE project_node_id = @projectNodeId
      `);
            const row = statement.get({ projectNodeId });
            return row ? mapDeliberationsRecordRow(row) : undefined;
        },
        createDeliberationsRecord(record) {
            const statement = database.prepare(`
        INSERT INTO deliberations_records (
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