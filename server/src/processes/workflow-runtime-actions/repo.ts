import type { SqliteDatabase } from '../../infra/db/index.js';

export interface WorkflowRuntimeActionContext {
  projectNodeId: string;
  projectNodeFolderPath: string;
  workflowId: string | null;
  mermaidSource: string | null;
  actionType: 'prompt' | 'tool' | null;
  targetRef: string | null;
  promptName: string | null;
  promptContentFilePath: string | null;
}

interface WorkflowRuntimeActionContextRow {
  project_node_id: string;
  project_node_folder_path: string;
  workflow_id: string | null;
  mermaid_source: string | null;
  action_type: 'prompt' | 'tool' | null;
  target_ref: string | null;
  prompt_name: string | null;
  prompt_content_file_path: string | null;
}

export function createWorkflowRuntimeActionsRepo(database: SqliteDatabase) {
  return {
    getWorkflowRuntimeActionContext(
      projectNodeId: string,
      mermaidNodeId: string,
    ): WorkflowRuntimeActionContext | undefined {
      const statement = database.prepare<WorkflowRuntimeActionContextRow>(`
        SELECT
          pn.id AS project_node_id,
          pn.folder_path AS project_node_folder_path,
          pnw.workflow_id,
          w.mermaid_source,
          wna.action_type,
          wna.target_ref,
          p.name AS prompt_name,
          p.content_file_path AS prompt_content_file_path
        FROM project_nodes pn
        LEFT JOIN project_node_workflows pnw
          ON pnw.project_node_id = pn.id
        LEFT JOIN workflows w
          ON w.id = pnw.workflow_id
        LEFT JOIN workflow_node_actions wna
          ON wna.workflow_id = pnw.workflow_id
         AND wna.mermaid_node_id = @mermaidNodeId
        LEFT JOIN prompts p
          ON p.id = wna.target_ref
         AND wna.action_type = 'prompt'
        WHERE pn.id = @projectNodeId
      `);
      const row = statement.get({
        projectNodeId,
        mermaidNodeId,
      });

      if (!row) {
        return undefined;
      }

      return {
        projectNodeId: row.project_node_id,
        projectNodeFolderPath: row.project_node_folder_path,
        workflowId: row.workflow_id,
        mermaidSource: row.mermaid_source,
        actionType: row.action_type,
        targetRef: row.target_ref,
        promptName: row.prompt_name,
        promptContentFilePath: row.prompt_content_file_path,
      };
    },
  };
}

export type WorkflowRuntimeActionsRepo = ReturnType<typeof createWorkflowRuntimeActionsRepo>;
