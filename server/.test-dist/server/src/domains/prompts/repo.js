function mapPromptRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        tags: row.tags,
        category: row.category,
        contentFilePath: row.content_file_path,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export function createPromptRepo(database) {
    return {
        listPrompts(query) {
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
          content_file_path,
          created_at,
          updated_at
        FROM prompts
        ${whereClause}
        ORDER BY updated_at DESC, name ASC
      `);
            return statement.all(parameters).map(mapPromptRow);
        },
        getPromptById(id) {
            const statement = database.prepare(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          content_file_path,
          created_at,
          updated_at
        FROM prompts
        WHERE id = @id
      `);
            const row = statement.get({ id });
            return row ? mapPromptRow(row) : undefined;
        },
        getPromptByFilePath(filePath) {
            const statement = database.prepare(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          content_file_path,
          created_at,
          updated_at
        FROM prompts
        WHERE content_file_path = @filePath
      `);
            const row = statement.get({ filePath });
            return row ? mapPromptRow(row) : undefined;
        },
        createPrompt(record) {
            const statement = database.prepare(`
        INSERT INTO prompts (
          id,
          name,
          description,
          tags,
          category,
          content_file_path,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @name,
          @description,
          @tags,
          @category,
          @contentFilePath,
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
                contentFilePath: record.contentFilePath,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            });
            return record;
        },
        updatePrompt(record) {
            const statement = database.prepare(`
        UPDATE prompts
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
        deletePromptById(id) {
            const statement = database.prepare(`
        DELETE FROM prompts
        WHERE id = @id
      `);
            statement.run({ id });
        },
        promptFilePathExists(filePath) {
            return this.getPromptByFilePath(filePath) !== undefined;
        },
    };
}
//# sourceMappingURL=repo.js.map