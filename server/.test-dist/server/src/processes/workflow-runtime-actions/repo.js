export function createWorkflowRuntimeActionsRepo(database) {
    return {
        getWorkflowRuntimeActionContext(projectNodeId, mermaidNodeId) {
            const statement = database.prepare(`
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
//# sourceMappingURL=repo.js.map