function mapProjectRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        tags: row.tags,
        category: row.category,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
function mapProjectNodeRow(row) {
    return {
        id: row.id,
        projectId: row.project_id,
    };
}
function mapProjectNodeLayoutRow(row) {
    return {
        id: row.id,
        projectId: row.project_id,
        projectNodeId: row.project_node_id,
        positionX: row.position_x,
        positionY: row.position_y,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
function mapProjectViewportRow(row) {
    return {
        id: row.id,
        projectId: row.project_id,
        viewportX: row.viewport_x,
        viewportY: row.viewport_y,
        zoom: row.zoom,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
export function createProjectViewConfigRepo(database) {
    return {
        getProjectById(id) {
            const statement = database.prepare(`
        SELECT
          id,
          name,
          description,
          tags,
          category,
          created_at,
          updated_at
        FROM projects
        WHERE id = @id
      `);
            const row = statement.get({ id });
            return row ? mapProjectRow(row) : undefined;
        },
        getProjectNodeByIdAndProjectId(projectId, projectNodeId) {
            const statement = database.prepare(`
        SELECT
          id,
          project_id
        FROM project_nodes
        WHERE project_id = @projectId AND id = @projectNodeId
      `);
            const row = statement.get({
                projectId,
                projectNodeId,
            });
            return row ? mapProjectNodeRow(row) : undefined;
        },
        listProjectNodeLayoutsByProjectId(projectId) {
            const statement = database.prepare(`
        SELECT
          project_node_layouts.id,
          project_nodes.project_id,
          project_node_layouts.project_node_id,
          project_node_layouts.position_x,
          project_node_layouts.position_y,
          project_node_layouts.created_at,
          project_node_layouts.updated_at
        FROM project_node_layouts
        INNER JOIN project_nodes
          ON project_nodes.id = project_node_layouts.project_node_id
        WHERE project_nodes.project_id = @projectId
        ORDER BY project_node_layouts.project_node_id ASC
      `);
            return statement.all({ projectId }).map(mapProjectNodeLayoutRow);
        },
        getProjectNodeLayoutByProjectIdAndProjectNodeId(projectId, projectNodeId) {
            const statement = database.prepare(`
        SELECT
          project_node_layouts.id,
          project_nodes.project_id,
          project_node_layouts.project_node_id,
          project_node_layouts.position_x,
          project_node_layouts.position_y,
          project_node_layouts.created_at,
          project_node_layouts.updated_at
        FROM project_node_layouts
        INNER JOIN project_nodes
          ON project_nodes.id = project_node_layouts.project_node_id
        WHERE project_nodes.project_id = @projectId
          AND project_node_layouts.project_node_id = @projectNodeId
      `);
            const row = statement.get({
                projectId,
                projectNodeId,
            });
            return row ? mapProjectNodeLayoutRow(row) : undefined;
        },
        upsertProjectNodeLayout(record) {
            const statement = database.prepare(`
        INSERT INTO project_node_layouts (
          id,
          project_node_id,
          position_x,
          position_y,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @projectNodeId,
          @positionX,
          @positionY,
          @createdAt,
          @updatedAt
        )
        ON CONFLICT(project_node_id) DO UPDATE SET
          position_x = excluded.position_x,
          position_y = excluded.position_y,
          updated_at = excluded.updated_at
      `);
            statement.run({
                id: record.id,
                projectNodeId: record.projectNodeId,
                positionX: record.positionX,
                positionY: record.positionY,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            });
            return record;
        },
        getProjectViewportByProjectId(projectId) {
            const statement = database.prepare(`
        SELECT
          id,
          project_id,
          viewport_x,
          viewport_y,
          zoom,
          created_at,
          updated_at
        FROM project_viewports
        WHERE project_id = @projectId
      `);
            const row = statement.get({ projectId });
            return row ? mapProjectViewportRow(row) : undefined;
        },
        upsertProjectViewport(record) {
            const statement = database.prepare(`
        INSERT INTO project_viewports (
          id,
          project_id,
          viewport_x,
          viewport_y,
          zoom,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @projectId,
          @viewportX,
          @viewportY,
          @zoom,
          @createdAt,
          @updatedAt
        )
        ON CONFLICT(project_id) DO UPDATE SET
          viewport_x = excluded.viewport_x,
          viewport_y = excluded.viewport_y,
          zoom = excluded.zoom,
          updated_at = excluded.updated_at
      `);
            statement.run({
                id: record.id,
                projectId: record.projectId,
                viewportX: record.viewportX,
                viewportY: record.viewportY,
                zoom: record.zoom,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            });
            return record;
        },
    };
}
//# sourceMappingURL=repo.js.map