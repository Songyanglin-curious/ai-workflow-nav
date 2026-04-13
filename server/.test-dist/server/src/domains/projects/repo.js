function mapProjectRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        tags: row.tags,
        category: row.category,
        folderPath: row.folder_path,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export function createProjectRepo(database) {
    return {
        listProjects(query) {
            const conditions = [];
            const parameters = {};
            if (query.keyword) {
                conditions.push('(name LIKE @keyword OR description LIKE @keyword)');
                parameters.keyword = `%${query.keyword}%`;
            }
            if (query.category) {
                conditions.push('category = @category');
                parameters.category = query.category;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const statement = database.prepare(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          folder_path,
          created_at,
          updated_at
        FROM projects
        ${whereClause}
        ORDER BY updated_at DESC, name ASC
      `);
            return statement.all(parameters).map(mapProjectRow);
        },
        getProjectById(id) {
            const statement = database.prepare(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          folder_path,
          created_at,
          updated_at
        FROM projects
        WHERE id = @id
      `);
            const row = statement.get({ id });
            return row ? mapProjectRow(row) : undefined;
        },
        getProjectByFolderPath(folderPath) {
            const statement = database.prepare(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          folder_path,
          created_at,
          updated_at
        FROM projects
        WHERE folder_path = @folderPath
      `);
            const row = statement.get({ folderPath });
            return row ? mapProjectRow(row) : undefined;
        },
        createProject(record) {
            const statement = database.prepare(`
        INSERT INTO projects (
          id,
          name,
          description,
          tags,
          category,
          folder_path,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @name,
          @description,
          @tags,
          @category,
          @folderPath,
          @createdAt,
          @updatedAt
        )
      `);
            statement.run({
                id: record.id,
                name: record.name,
                description: record.description,
                tags: record.tags,
                category: record.category,
                folderPath: record.folderPath,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            });
            return record;
        },
        updateProject(record) {
            const statement = database.prepare(`
        UPDATE projects
        SET
          name = @name,
          description = @description,
          tags = @tags,
          category = @category,
          updated_at = @updatedAt
        WHERE id = @id
      `);
            statement.run({
                id: record.id,
                name: record.name,
                description: record.description,
                tags: record.tags,
                category: record.category,
                updatedAt: record.updatedAt,
            });
            return record;
        },
    };
}
//# sourceMappingURL=repo.js.map