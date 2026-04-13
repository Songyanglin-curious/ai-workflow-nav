import type { SqliteDatabase } from '../../../infra/db/index.js';

export interface DeliberationsRecord {
  id: string;
  projectNodeId: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliberationsRecordRow {
  id: string;
  project_node_id: string;
  folder_path: string;
  created_at: string;
  updated_at: string;
}

function mapDeliberationsRecordRow(row: DeliberationsRecordRow): DeliberationsRecord {
  return {
    id: row.id,
    projectNodeId: row.project_node_id,
    folderPath: row.folder_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createDeliberationsRecord(
  projectNodeId: string,
  folderPath: string,
  timestamp: string,
  id: string,
): DeliberationsRecord {
  return {
    id,
    projectNodeId,
    folderPath,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createDeliberationsRepo(database: SqliteDatabase) {
  return {
    getDeliberationsRecordByProjectNodeId(projectNodeId: string): DeliberationsRecord | undefined {
      const statement = database.prepare<DeliberationsRecordRow>(`
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

    createDeliberationsRecord(record: DeliberationsRecord): DeliberationsRecord {
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

export type DeliberationsRepo = ReturnType<typeof createDeliberationsRepo>;
