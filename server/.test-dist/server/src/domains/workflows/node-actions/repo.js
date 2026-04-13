function mapWorkflowNodeActionRow(row) {
    return {
        id: row.id,
        workflowId: row.workflow_id,
        mermaidNodeId: row.mermaid_node_id,
        actionType: row.action_type,
        targetRef: row.target_ref,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export function createWorkflowNodeActionRepo(database) {
    return {
        listNodeActionsByWorkflowId(workflowId) {
            const statement = database.prepare(`
        SELECT
          id,
          workflow_id,
          mermaid_node_id,
          action_type,
          target_ref,
          created_at,
          updated_at
        FROM workflow_node_actions
        WHERE workflow_id = @workflowId
        ORDER BY mermaid_node_id ASC
      `);
            return statement.all({ workflowId }).map(mapWorkflowNodeActionRow);
        },
        getNodeActionByWorkflowIdAndMermaidNodeId(workflowId, mermaidNodeId) {
            const statement = database.prepare(`
        SELECT
          id,
          workflow_id,
          mermaid_node_id,
          action_type,
          target_ref,
          created_at,
          updated_at
        FROM workflow_node_actions
        WHERE workflow_id = @workflowId AND mermaid_node_id = @mermaidNodeId
      `);
            const row = statement.get({
                workflowId,
                mermaidNodeId,
            });
            return row ? mapWorkflowNodeActionRow(row) : undefined;
        },
        createNodeAction(record) {
            const statement = database.prepare(`
        INSERT INTO workflow_node_actions (
          id,
          workflow_id,
          mermaid_node_id,
          action_type,
          target_ref,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @workflowId,
          @mermaidNodeId,
          @actionType,
          @targetRef,
          @createdAt,
          @updatedAt
        )
      `);
            statement.run({
                id: record.id,
                workflowId: record.workflowId,
                mermaidNodeId: record.mermaidNodeId,
                actionType: record.actionType,
                targetRef: record.targetRef,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            });
            return record;
        },
        updateNodeActionByWorkflowIdAndMermaidNodeId(workflowId, mermaidNodeId, patch) {
            const statement = database.prepare(`
        UPDATE workflow_node_actions
        SET
          action_type = @actionType,
          target_ref = @targetRef,
          updated_at = @updatedAt
        WHERE workflow_id = @workflowId AND mermaid_node_id = @mermaidNodeId
      `);
            statement.run({
                workflowId,
                mermaidNodeId,
                actionType: patch.actionType,
                targetRef: patch.targetRef,
                updatedAt: patch.updatedAt,
            });
        },
        deleteNodeActionByWorkflowIdAndMermaidNodeId(workflowId, mermaidNodeId) {
            const statement = database.prepare(`
        DELETE FROM workflow_node_actions
        WHERE workflow_id = @workflowId AND mermaid_node_id = @mermaidNodeId
      `);
            statement.run({
                workflowId,
                mermaidNodeId,
            });
        },
    };
}
//# sourceMappingURL=repo.js.map