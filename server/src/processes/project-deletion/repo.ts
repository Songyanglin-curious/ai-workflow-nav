import type { SqliteDatabase } from '../../infra/db/index.js';

export interface ProjectArchiveTarget {
  projectNodeId: string;
  nodeFolderPath: string;
  summaryFolderPath: string;
}

export interface ProjectDeletionSnapshot {
  projectId: string;
  projectFolderPath: string;
  projectNodeCount: number;
  archiveTargets: ProjectArchiveTarget[];
}

interface ProjectDeletionRow {
  project_id: string;
  project_folder_path: string;
}

interface ProjectArchiveTargetRow {
  project_node_id: string;
  node_folder_path: string;
  summary_folder_path: string;
}

export function createProjectDeletionRepo(database: SqliteDatabase) {
  return {
    getProjectDeletionSnapshot(projectId: string): ProjectDeletionSnapshot | undefined {
      const projectStatement = database.prepare<ProjectDeletionRow>(`
        SELECT
          id AS project_id,
          folder_path AS project_folder_path
        FROM projects
        WHERE id = @projectId
      `);
      const projectRow = projectStatement.get({ projectId });

      if (!projectRow) {
        return undefined;
      }

      const countStatement = database.prepare<{ count: number }>(`
        SELECT COUNT(*) AS count
        FROM project_nodes
        WHERE project_id = @projectId
      `);
      const archiveTargetsStatement = database.prepare<ProjectArchiveTargetRow>(`
        SELECT
          pn.id AS project_node_id,
          pn.folder_path AS node_folder_path,
          sr.folder_path AS summary_folder_path
        FROM project_nodes pn
        INNER JOIN summary_records sr
          ON sr.project_node_id = pn.id
        WHERE pn.project_id = @projectId
        ORDER BY pn.id ASC
      `);
      const countRow = countStatement.get({ projectId });
      const archiveTargets = archiveTargetsStatement.all({ projectId }).map((row) => ({
        projectNodeId: row.project_node_id,
        nodeFolderPath: row.node_folder_path,
        summaryFolderPath: row.summary_folder_path,
      }));

      return {
        projectId: projectRow.project_id,
        projectFolderPath: projectRow.project_folder_path,
        projectNodeCount: countRow?.count ?? 0,
        archiveTargets,
      };
    },

    listProjectArchiveTargets(projectId: string): ProjectArchiveTarget[] {
      return this.getProjectDeletionSnapshot(projectId)?.archiveTargets ?? [];
    },

    deleteProjectViewConfig(projectId: string): void {
      database
        .prepare(`
          DELETE FROM project_viewports
          WHERE project_id = @projectId
        `)
        .run({ projectId });

      database
        .prepare(`
          DELETE FROM project_node_layouts
          WHERE project_node_id IN (
            SELECT id
            FROM project_nodes
            WHERE project_id = @projectId
          )
        `)
        .run({ projectId });
    },

    deleteProjectNodeRelationsByProjectId(projectId: string): void {
      database
        .prepare(`
          DELETE FROM project_node_relations
          WHERE project_id = @projectId
        `)
        .run({ projectId });
    },

    deleteProjectNodeWorkflowsByProjectId(projectId: string): void {
      database
        .prepare(`
          DELETE FROM project_node_workflows
          WHERE project_node_id IN (
            SELECT id
            FROM project_nodes
            WHERE project_id = @projectId
          )
        `)
        .run({ projectId });
    },

    deleteProjectNodesByProjectId(projectId: string): void {
      database
        .prepare(`
          DELETE FROM project_nodes
          WHERE project_id = @projectId
        `)
        .run({ projectId });
    },

    deleteSolutionProjectsByProjectId(projectId: string): void {
      database
        .prepare(`
          DELETE FROM solution_projects
          WHERE project_id = @projectId
        `)
        .run({ projectId });
    },

    deleteProjectById(projectId: string): void {
      database
        .prepare(`
          DELETE FROM projects
          WHERE id = @projectId
        `)
        .run({ projectId });
    },
  };
}

export type ProjectDeletionRepo = ReturnType<typeof createProjectDeletionRepo>;
