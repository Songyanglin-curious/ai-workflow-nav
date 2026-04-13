import type { SqliteDatabase } from '../../infra/db/index.js';

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectQuery {
  keyword?: string;
  category?: string;
}

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  folder_path: string;
  created_at: string;
  updated_at: string;
}

function mapProjectRow(row: ProjectRow): ProjectRecord {
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

export function createProjectRepo(database: SqliteDatabase) {
  return {
    listProjects(query: ProjectQuery): ProjectRecord[] {
      const conditions: string[] = [];
      const parameters: Record<string, unknown> = {};

      if (query.keyword) {
        conditions.push('(name LIKE @keyword OR description LIKE @keyword)');
        parameters.keyword = `%${query.keyword}%`;
      }

      if (query.category) {
        conditions.push('category = @category');
        parameters.category = query.category;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const statement = database.prepare<ProjectRow>(`
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

    getProjectById(id: string): ProjectRecord | undefined {
      const statement = database.prepare<ProjectRow>(`
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

    getProjectByFolderPath(folderPath: string): ProjectRecord | undefined {
      const statement = database.prepare<ProjectRow>(`
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

    createProject(record: ProjectRecord): ProjectRecord {
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

    updateProject(record: ProjectRecord): ProjectRecord {
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

export type ProjectRepo = ReturnType<typeof createProjectRepo>;
