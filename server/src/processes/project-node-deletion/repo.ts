import type { SqliteDatabase } from '../../infra/db/index.js';

export interface ProjectNodeDeletionSnapshot {
  projectNodeId: string;
  projectId: string;
  projectFolderPath: string;
  nodeFolderPath: string;
  summaryFolderPath: string;
  rootTailSortOrder: number | undefined;
  directChildren: Array<{
    projectNodeId: string;
    sortOrder: number;
  }>;
}

interface ProjectNodeDeletionRow {
  project_node_id: string;
  project_id: string;
  project_folder_path: string;
  node_folder_path: string;
  summary_folder_path: string;
}

interface DirectChildRow {
  child_project_node_id: string;
  sort_order: number;
}

export function createProjectNodeDeletionRepo(database: SqliteDatabase) {
  return {
    getProjectNodeDeletionSnapshot(projectNodeId: string): ProjectNodeDeletionSnapshot | undefined {
      const nodeStatement = database.prepare<ProjectNodeDeletionRow>(`
        SELECT
          pn.id AS project_node_id,
          pn.project_id,
          p.folder_path AS project_folder_path,
          pn.folder_path AS node_folder_path,
          sr.folder_path AS summary_folder_path
        FROM project_nodes pn
        INNER JOIN projects p
          ON p.id = pn.project_id
        INNER JOIN summary_records sr
          ON sr.project_node_id = pn.id
        WHERE pn.id = @projectNodeId
      `);
      const nodeRow = nodeStatement.get({ projectNodeId });

      if (!nodeRow) {
        return undefined;
      }

      const rootTailStatement = database.prepare<{ sort_order: number | null }>(`
        SELECT MAX(sort_order) AS sort_order
        FROM project_node_relations
        WHERE project_id = @projectId AND parent_project_node_id IS NULL
      `);
      const directChildrenStatement = database.prepare<DirectChildRow>(`
        SELECT
          child_project_node_id,
          sort_order
        FROM project_node_relations
        WHERE parent_project_node_id = @projectNodeId
        ORDER BY sort_order ASC, child_project_node_id ASC
      `);
      const rootTailRow = rootTailStatement.get({
        projectId: nodeRow.project_id,
      });
      const directChildren = directChildrenStatement.all({ projectNodeId }).map((row) => ({
        projectNodeId: row.child_project_node_id,
        sortOrder: row.sort_order,
      }));

      return {
        projectNodeId: nodeRow.project_node_id,
        projectId: nodeRow.project_id,
        projectFolderPath: nodeRow.project_folder_path,
        nodeFolderPath: nodeRow.node_folder_path,
        summaryFolderPath: nodeRow.summary_folder_path,
        rootTailSortOrder: rootTailRow?.sort_order ?? undefined,
        directChildren,
      };
    },

    promoteDirectChildrenToRoot(projectNodeId: string, targetRootSortStart: number, sortStep: number): number {
      const childrenStatement = database.prepare<DirectChildRow>(`
        SELECT
          child_project_node_id,
          sort_order
        FROM project_node_relations
        WHERE parent_project_node_id = @projectNodeId
        ORDER BY sort_order ASC, child_project_node_id ASC
      `);
      const updateStatement = database.prepare(`
        UPDATE project_node_relations
        SET
          parent_project_node_id = NULL,
          sort_order = @sortOrder
        WHERE child_project_node_id = @projectNodeId
      `);
      const children = childrenStatement.all({ projectNodeId });

      children.forEach((child, index) => {
        updateStatement.run({
          projectNodeId: child.child_project_node_id,
          sortOrder: targetRootSortStart + index * sortStep,
        });
      });

      return children.length;
    },

    deleteProjectNodeWorkflowByNodeId(projectNodeId: string): void {
      database
        .prepare(`
          DELETE FROM project_node_workflows
          WHERE project_node_id = @projectNodeId
        `)
        .run({ projectNodeId });
    },

    deleteProjectNodeRelationByNodeId(projectNodeId: string): void {
      database
        .prepare(`
          DELETE FROM project_node_relations
          WHERE child_project_node_id = @projectNodeId
        `)
        .run({ projectNodeId });
    },

    deleteDeliberationsRecordByNodeId(projectNodeId: string): void {
      database
        .prepare(`
          DELETE FROM deliberations_records
          WHERE project_node_id = @projectNodeId
        `)
        .run({ projectNodeId });
    },

    deleteSummaryRecordByNodeId(projectNodeId: string): void {
      database
        .prepare(`
          DELETE FROM summary_records
          WHERE project_node_id = @projectNodeId
        `)
        .run({ projectNodeId });
    },

    deleteProjectNodeById(projectNodeId: string): void {
      database
        .prepare(`
          DELETE FROM project_nodes
          WHERE id = @projectNodeId
        `)
        .run({ projectNodeId });
    },
  };
}

export type ProjectNodeDeletionRepo = ReturnType<typeof createProjectNodeDeletionRepo>;
