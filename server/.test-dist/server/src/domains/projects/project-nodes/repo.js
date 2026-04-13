function mapProjectNodeRow(row) {
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
function mapProjectNodeEntityRow(row) {
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
function mapProjectNodeRelationRow(row) {
    return {
        id: row.id,
        projectId: row.project_id,
        parentProjectNodeId: row.parent_project_node_id,
        childProjectNodeId: row.child_project_node_id,
        sortOrder: row.sort_order,
        createdAt: row.created_at,
    };
}
function mapProjectNodeWorkflowRow(row) {
    return {
        id: row.id,
        projectNodeId: row.project_node_id,
        workflowId: row.workflow_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export function createProjectNodeRepo(database) {
    return {
        listProjectNodes(projectId, query) {
            const conditions = ['pn.project_id = @projectId'];
            const parameters = {
                projectId,
            };
            if (query.parentNodeId === null) {
                conditions.push('rel.parent_project_node_id IS NULL');
            }
            else if (query.parentNodeId !== undefined) {
                conditions.push('rel.parent_project_node_id = @parentNodeId');
                parameters.parentNodeId = query.parentNodeId;
            }
            if (query.status) {
                conditions.push('pn.status = @status');
                parameters.status = query.status;
            }
            const statement = database.prepare(`
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
        getProjectNodeById(id) {
            const statement = database.prepare(`
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
        getProjectNodeEntityById(id) {
            const statement = database.prepare(`
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
        createProjectNode(record) {
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
        updateProjectNode(record) {
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
        createProjectNodeRelation(record) {
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
        getProjectNodeRelationByChildId(projectId, childProjectNodeId) {
            const statement = database.prepare(`
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
        listProjectNodeRelationsByProjectId(projectId) {
            const statement = database.prepare(`
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
        updateProjectNodeRelationByChildId(projectId, childProjectNodeId, patch) {
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
        getMaxSortOrderByParent(projectId, parentProjectNodeId) {
            const condition = parentProjectNodeId === null
                ? 'parent_project_node_id IS NULL'
                : 'parent_project_node_id = @parentProjectNodeId';
            const statement = database.prepare(`
        SELECT MAX(sort_order) AS sort_order
        FROM project_node_relations
        WHERE project_id = @projectId AND ${condition}
      `);
            const row = parentProjectNodeId === null
                ? statement.get({ projectId })
                : statement.get({ projectId, parentProjectNodeId });
            return row?.sort_order ?? undefined;
        },
        getProjectNodeWorkflowByNodeId(projectNodeId) {
            const statement = database.prepare(`
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
        createProjectNodeWorkflow(record) {
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
        updateProjectNodeWorkflowByNodeId(projectNodeId, workflowId, updatedAt) {
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
        deleteProjectNodeWorkflowByNodeId(projectNodeId) {
            const statement = database.prepare(`
        DELETE FROM project_node_workflows
        WHERE project_node_id = @projectNodeId
      `);
            statement.run({ projectNodeId });
        },
    };
}
//# sourceMappingURL=repo.js.map