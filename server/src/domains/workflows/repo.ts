import type { SqliteDatabase } from '../../infra/db/index.js';

export interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  mermaidSource: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowQuery {
  keyword?: string;
  category?: string;
}

interface WorkflowRow {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  mermaid_source: string;
  created_at: string;
  updated_at: string;
}

function mapWorkflowRow(row: WorkflowRow): WorkflowRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    tags: row.tags,
    category: row.category,
    mermaidSource: row.mermaid_source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createWorkflowRepo(database: SqliteDatabase) {
  return {
    listWorkflows(query: WorkflowQuery): WorkflowRecord[] {
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
      const statement = database.prepare<WorkflowRow>(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          mermaid_source,
          created_at,
          updated_at
        FROM workflows
        ${whereClause}
        ORDER BY updated_at DESC, name ASC
      `);

      return statement.all(parameters).map(mapWorkflowRow);
    },

    getWorkflowById(id: string): WorkflowRecord | undefined {
      const statement = database.prepare<WorkflowRow>(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          mermaid_source,
          created_at,
          updated_at
        FROM workflows
        WHERE id = @id
      `);

      const row = statement.get({ id });
      return row ? mapWorkflowRow(row) : undefined;
    },

    createWorkflow(record: WorkflowRecord): WorkflowRecord {
      const statement = database.prepare(`
        INSERT INTO workflows (
          id,
          name,
          description,
          tags,
          category,
          mermaid_source,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @name,
          @description,
          @tags,
          @category,
          @mermaidSource,
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
        mermaidSource: record.mermaidSource,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });

      return record;
    },

    updateWorkflow(record: WorkflowRecord): WorkflowRecord {
      const statement = database.prepare(`
        UPDATE workflows
        SET
          name = @name,
          description = @description,
          tags = @tags,
          category = @category,
          mermaid_source = @mermaidSource,
          updated_at = @updatedAt
        WHERE id = @id
      `);

      statement.run({
        id: record.id,
        name: record.name,
        description: record.description,
        tags: record.tags,
        category: record.category,
        mermaidSource: record.mermaidSource,
        updatedAt: record.updatedAt,
      });

      return record;
    },

    deleteWorkflowById(id: string): void {
      const statement = database.prepare(`
        DELETE FROM workflows
        WHERE id = @id
      `);

      statement.run({ id });
    },
  };
}

export type WorkflowRepo = ReturnType<typeof createWorkflowRepo>;
