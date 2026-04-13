import type { SqliteDatabase } from '../../../infra/db/index.js';

export interface ProjectNodeRecord {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'default' | 'todo' | 'fix';
  folderPath: string;
  parentNodeId: string | null;
  sortOrder: number;
  workflowId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectNodeQuery {
  parentNodeId?: string | null;
  status?: 'default' | 'todo' | 'fix';
}

export interface ProjectNodeEntityRecord {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'default' | 'todo' | 'fix';
  folderPath: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectNodeRelationRecord {
  id: string;
  projectId: string;
  parentProjectNodeId: string | null;
  childProjectNodeId: string;
  sortOrder: number;
  createdAt: string;
}

export interface ProjectNodeWorkflowRecord {
  id: string;
  projectNodeId: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectNodeRow {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'default' | 'todo' | 'fix';
  folder_path: string;
  parent_node_id: string | null;
  sort_order: number;
  workflow_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectNodeEntityRow {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'default' | 'todo' | 'fix';
  folder_path: string;
  created_at: string;
  updated_at: string;
}

interface ProjectNodeRelationRow {
  id: string;
  project_id: string;
  parent_project_node_id: string | null;
  child_project_node_id: string;
  sort_order: number;
  created_at: string;
}

interface ProjectNodeWorkflowRow {
  id: string;
  project_node_id: string;
  workflow_id: string;
  created_at: string;
  updated_at: string;
}

function mapProjectNodeRow(row: ProjectNodeRow): ProjectNodeRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    status: row.status,
    folderPath: row.folder_path,
    parentNodeId: row.parent_node_id,
    sortOrder: row.sort_order,
    workflowId: row.workflow_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProjectNodeEntityRow(row: ProjectNodeEntityRow): ProjectNodeEntityRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    description: row.description,
    status: row.status,
    folderPath: row.folder_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProjectNodeRelationRow(row: ProjectNodeRelationRow): ProjectNodeRelationRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    parentProjectNodeId: row.parent_project_node_id,
    childProjectNodeId: row.child_project_node_id,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function mapProjectNodeWorkflowRow(row: ProjectNodeWorkflowRow): ProjectNodeWorkflowRecord {
  return {
    id: row.id,
    projectNodeId: row.project_node_id,
    workflowId: row.workflow_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createProjectNodeRepo(database: SqliteDatabase) {
  return {
    listProjectNodes(projectId: string, query: ProjectNodeQuery): ProjectNodeRecord[] {
      const conditions = ['pn.project_id = @projectId'];
      const parameters: Record<string, unknown> = {
        projectId,
      };

      if (query.parentNodeId === null) {
        conditions.push('rel.parent_project_node_id IS NULL');
      } else if (query.parentNodeId !== undefined) {
        conditions.push('rel.parent_project_node_id = @parentNodeId');
        parameters.parentNodeId = query.parentNodeId;
      }

      if (query.status) {
        conditions.push('pn.status = @status');
        parameters.status = query.status;
      }

      const statement = database.prepare<ProjectNodeRow>(`
        SELECT
          pn.id,
          pn.project_id,
          pn.name,
          pn.description,
          pn.status,
          pn.folder_path,
          rel.parent_project_node_id AS parent_node_id,
          rel.sort_order,
          pnw.workflow_id,
          pn.created_at,
          pn.updated_at
        FROM project_nodes pn
        INNER JOIN project_node_relations rel
          ON rel.child_project_node_id = pn.id
         AND rel.project_id = pn.project_id
        LEFT JOIN project_node_workflows pnw
          ON pnw.project_node_id = pn.id
        WHERE ${conditions.join(' AND ')}
        ORDER BY rel.sort_order ASC, pn.created_at ASC
      `);

      return statement.all(parameters).map(mapProjectNodeRow);
    },

    getProjectNodeById(id: string): ProjectNodeRecord | undefined {
      const statement = database.prepare<ProjectNodeRow>(`
        SELECT
          pn.id,
          pn.project_id,
          pn.name,
          pn.description,
          pn.status,
          pn.folder_path,
          rel.parent_project_node_id AS parent_node_id,
          rel.sort_order,
          pnw.workflow_id,
          pn.created_at,
          pn.updated_at
        FROM project_nodes pn
        INNER JOIN project_node_relations rel
          ON rel.child_project_node_id = pn.id
         AND rel.project_id = pn.project_id
        LEFT JOIN project_node_workflows pnw
          ON pnw.project_node_id = pn.id
        WHERE pn.id = @id
      `);

      const row = statement.get({ id });
      return row ? mapProjectNodeRow(row) : undefined;
    },

    getProjectNodeEntityById(id: string): ProjectNodeEntityRecord | undefined {
      const statement = database.prepare<ProjectNodeEntityRow>(`
        SELECT
          id,
          project_id,
          name,
          description,
          status,
          folder_path,
          created_at,
          updated_at
        FROM project_nodes
        WHERE id = @id
      `);

      const row = statement.get({ id });
      return row ? mapProjectNodeEntityRow(row) : undefined;
    },

    createProjectNode(record: ProjectNodeEntityRecord): ProjectNodeEntityRecord {
      const statement = database.prepare(`
        INSERT INTO project_nodes (
          id,
          project_id,
          name,
          description,
          status,
          folder_path,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @projectId,
          @name,
          @description,
          @status,
          @folderPath,
          @createdAt,
          @updatedAt
        )
      `);

      statement.run({
        id: record.id,
        projectId: record.projectId,
        name: record.name,
        description: record.description,
        status: record.status,
        folderPath: record.folderPath,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });

      return record;
    },

    updateProjectNode(record: ProjectNodeEntityRecord): ProjectNodeEntityRecord {
      const statement = database.prepare(`
        UPDATE project_nodes
        SET
          name = @name,
          description = @description,
          status = @status,
          updated_at = @updatedAt
        WHERE id = @id
      `);

      statement.run({
        id: record.id,
        name: record.name,
        description: record.description,
        status: record.status,
        updatedAt: record.updatedAt,
      });

      return record;
    },

    createProjectNodeRelation(record: ProjectNodeRelationRecord): ProjectNodeRelationRecord {
      const statement = database.prepare(`
        INSERT INTO project_node_relations (
          id,
          project_id,
          parent_project_node_id,
          child_project_node_id,
          sort_order,
          created_at
        ) VALUES (
          @id,
          @projectId,
          @parentProjectNodeId,
          @childProjectNodeId,
          @sortOrder,
          @createdAt
        )
      `);

      statement.run({
        id: record.id,
        projectId: record.projectId,
        parentProjectNodeId: record.parentProjectNodeId,
        childProjectNodeId: record.childProjectNodeId,
        sortOrder: record.sortOrder,
        createdAt: record.createdAt,
      });

      return record;
    },

    getProjectNodeRelationByChildId(projectId: string, childProjectNodeId: string): ProjectNodeRelationRecord | undefined {
      const statement = database.prepare<ProjectNodeRelationRow>(`
        SELECT
          id,
          project_id,
          parent_project_node_id,
          child_project_node_id,
          sort_order,
          created_at
        FROM project_node_relations
        WHERE project_id = @projectId AND child_project_node_id = @childProjectNodeId
      `);

      const row = statement.get({
        projectId,
        childProjectNodeId,
      });

      return row ? mapProjectNodeRelationRow(row) : undefined;
    },

    listProjectNodeRelationsByProjectId(projectId: string): ProjectNodeRelationRecord[] {
      const statement = database.prepare<ProjectNodeRelationRow>(`
        SELECT
          id,
          project_id,
          parent_project_node_id,
          child_project_node_id,
          sort_order,
          created_at
        FROM project_node_relations
        WHERE project_id = @projectId
      `);

      return statement.all({ projectId }).map(mapProjectNodeRelationRow);
    },

    updateProjectNodeRelationByChildId(
      projectId: string,
      childProjectNodeId: string,
      patch: {
        parentProjectNodeId: string | null;
        sortOrder: number;
      },
    ): void {
      const statement = database.prepare(`
        UPDATE project_node_relations
        SET
          parent_project_node_id = @parentProjectNodeId,
          sort_order = @sortOrder
        WHERE project_id = @projectId AND child_project_node_id = @childProjectNodeId
      `);

      statement.run({
        projectId,
        childProjectNodeId,
        parentProjectNodeId: patch.parentProjectNodeId,
        sortOrder: patch.sortOrder,
      });
    },

    getMaxSortOrderByParent(projectId: string, parentProjectNodeId: string | null): number | undefined {
      const condition =
        parentProjectNodeId === null
          ? 'parent_project_node_id IS NULL'
          : 'parent_project_node_id = @parentProjectNodeId';
      const statement = database.prepare<{ sort_order: number | null }>(`
        SELECT MAX(sort_order) AS sort_order
        FROM project_node_relations
        WHERE project_id = @projectId AND ${condition}
      `);

      const row =
        parentProjectNodeId === null
          ? statement.get({ projectId })
          : statement.get({ projectId, parentProjectNodeId });

      return row?.sort_order ?? undefined;
    },

    getProjectNodeWorkflowByNodeId(projectNodeId: string): ProjectNodeWorkflowRecord | undefined {
      const statement = database.prepare<ProjectNodeWorkflowRow>(`
        SELECT
          id,
          project_node_id,
          workflow_id,
          created_at,
          updated_at
        FROM project_node_workflows
        WHERE project_node_id = @projectNodeId
      `);

      const row = statement.get({ projectNodeId });
      return row ? mapProjectNodeWorkflowRow(row) : undefined;
    },

    createProjectNodeWorkflow(record: ProjectNodeWorkflowRecord): ProjectNodeWorkflowRecord {
      const statement = database.prepare(`
        INSERT INTO project_node_workflows (
          id,
          project_node_id,
          workflow_id,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @projectNodeId,
          @workflowId,
          @createdAt,
          @updatedAt
        )
      `);

      statement.run({
        id: record.id,
        projectNodeId: record.projectNodeId,
        workflowId: record.workflowId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });

      return record;
    },

    updateProjectNodeWorkflowByNodeId(projectNodeId: string, workflowId: string, updatedAt: string): void {
      const statement = database.prepare(`
        UPDATE project_node_workflows
        SET
          workflow_id = @workflowId,
          updated_at = @updatedAt
        WHERE project_node_id = @projectNodeId
      `);

      statement.run({
        projectNodeId,
        workflowId,
        updatedAt,
      });
    },

    deleteProjectNodeWorkflowByNodeId(projectNodeId: string): void {
      const statement = database.prepare(`
        DELETE FROM project_node_workflows
        WHERE project_node_id = @projectNodeId
      `);

      statement.run({ projectNodeId });
    },
  };
}

export type ProjectNodeRepo = ReturnType<typeof createProjectNodeRepo>;
