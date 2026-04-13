import type { SqliteDatabase } from '../../../infra/db/index.js';

export interface SummaryRecord {
  id: string;
  projectNodeId: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

interface SummaryRecordRow {
  id: string;
  project_node_id: string;
  folder_path: string;
  created_at: string;
  updated_at: string;
}

function mapSummaryRecordRow(row: SummaryRecordRow): SummaryRecord {
  return {
    id: row.id,
    projectNodeId: row.project_node_id,
    folderPath: row.folder_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createSummaryRecord(
  projectNodeId: string,
  folderPath: string,
  timestamp: string,
  id: string,
): SummaryRecord {
  return {
    id,
    projectNodeId,
    folderPath,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createSummaryRepo(database: SqliteDatabase) {
  return {
    getSummaryRecordByProjectNodeId(projectNodeId: string): SummaryRecord | undefined {
      const statement = database.prepare<SummaryRecordRow>(`
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

    createSummaryRecord(record: SummaryRecord): SummaryRecord {
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

export type SummaryRepo = ReturnType<typeof createSummaryRepo>;
