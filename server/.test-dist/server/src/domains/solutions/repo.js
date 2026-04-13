function mapSolutionRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        tags: row.tags,
        category: row.category,
        projectCount: row.project_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
function mapProjectRow(row) {
    return {
        id: row.id,
        name: row.name,
        updatedAt: row.updated_at,
    };
}
function mapSolutionProjectRow(row) {
    return {
        id: row.id,
        solutionId: row.solution_id,
        projectId: row.project_id,
        sortOrder: row.sort_order,
        projectName: row.project_name,
        createdAt: row.created_at,
    };
}
function mapProjectSolutionRow(row) {
    return {
        projectId: row.project_id,
        solutionId: row.solution_id,
        solutionName: row.solution_name,
        sortOrder: row.sort_order,
        solutionUpdatedAt: row.solution_updated_at,
    };
}
export function createSolutionRepo(database) {
    return {
        listSolutions(query) {
            const conditions = [];
            const parameters = {};
            if (query.keyword) {
                conditions.push('(name LIKE @keyword OR description LIKE @keyword)');
                parameters.keyword = `%${query.keyword}%`;
            }
            if (query.category) {
                conditions.push('category = @category');
                parameters.category = query.category;
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const statement = database.prepare(`
        SELECT
          s.id,
          s.name,
          s.description,
          s.tags,
          s.category,
          COALESCE((
            SELECT COUNT(*)
            FROM solution_projects sp
            WHERE sp.solution_id = s.id
          ), 0) AS project_count,
          s.created_at,
          s.updated_at
        FROM solutions s
        ${whereClause}
        ORDER BY s.updated_at DESC, s.name ASC
      `);
            return statement.all(parameters).map(mapSolutionRow);
        },
        getSolutionById(id) {
            const statement = database.prepare(`
        SELECT
          s.id,
          s.name,
          s.description,
          s.tags,
          s.category,
          COALESCE((
            SELECT COUNT(*)
            FROM solution_projects sp
            WHERE sp.solution_id = s.id
          ), 0) AS project_count,
          s.created_at,
          s.updated_at
        FROM solutions s
        WHERE s.id = @id
      `);
            const row = statement.get({ id });
            return row ? mapSolutionRow(row) : undefined;
        },
        createSolution(record) {
            const statement = database.prepare(`
        INSERT INTO solutions (
          id,
          name,
          description,
          tags,
          category,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @name,
          @description,
          @tags,
          @category,
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
                createdAt: record.createdAt,
                updatedAt: record.updatedAt,
            });
            return record;
        },
        updateSolution(record) {
            const statement = database.prepare(`
        UPDATE solutions
        SET
          name = @name,
          description = @description,
          tags = @tags,
          category = @category,
          updated_at = @updatedAt
        WHERE id = @id
      `);
            statement.run({
                id: record.id,
                name: record.name,
                description: record.description,
                tags: record.tags,
                category: record.category,
                updatedAt: record.updatedAt,
            });
            return record;
        },
        deleteSolutionById(id) {
            const statement = database.prepare(`
        DELETE FROM solutions
        WHERE id = @id
      `);
            statement.run({ id });
        },
        getProjectById(id) {
            const statement = database.prepare(`
        SELECT
          id,
          name,
          updated_at
        FROM projects
        WHERE id = @id
      `);
            const row = statement.get({ id });
            return row ? mapProjectRow(row) : undefined;
        },
        getSolutionProjectBySolutionIdAndProjectId(solutionId, projectId) {
            const statement = database.prepare(`
        SELECT
          sp.id,
          sp.solution_id,
          sp.project_id,
          sp.sort_order,
          p.name AS project_name,
          sp.created_at
        FROM solution_projects sp
        INNER JOIN projects p ON p.id = sp.project_id
        WHERE sp.solution_id = @solutionId AND sp.project_id = @projectId
      `);
            const row = statement.get({
                solutionId,
                projectId,
            });
            return row ? mapSolutionProjectRow(row) : undefined;
        },
        getNextSolutionProjectSortOrder(solutionId) {
            const statement = database.prepare(`
        SELECT COALESCE(MAX(sort_order) + 1, 0) AS next_sort_order
        FROM solution_projects
        WHERE solution_id = @solutionId
      `);
            const row = statement.get({ solutionId });
            return row?.next_sort_order ?? 0;
        },
        createSolutionProject(record) {
            const statement = database.prepare(`
        INSERT INTO solution_projects (
          id,
          solution_id,
          project_id,
          sort_order,
          created_at
        ) VALUES (
          @id,
          @solutionId,
          @projectId,
          @sortOrder,
          @createdAt
        )
      `);
            statement.run({
                id: record.id,
                solutionId: record.solutionId,
                projectId: record.projectId,
                sortOrder: record.sortOrder,
                createdAt: record.createdAt,
            });
            return record;
        },
        updateSolutionProjectSortOrder(solutionId, projectId, sortOrder) {
            const statement = database.prepare(`
        UPDATE solution_projects
        SET sort_order = @sortOrder
        WHERE solution_id = @solutionId AND project_id = @projectId
      `);
            statement.run({
                solutionId,
                projectId,
                sortOrder,
            });
        },
        deleteSolutionProjectBySolutionIdAndProjectId(solutionId, projectId) {
            const statement = database.prepare(`
        DELETE FROM solution_projects
        WHERE solution_id = @solutionId AND project_id = @projectId
      `);
            statement.run({
                solutionId,
                projectId,
            });
        },
        listSolutionProjectsBySolutionId(solutionId) {
            const statement = database.prepare(`
        SELECT
          sp.id,
          sp.solution_id,
          sp.project_id,
          sp.sort_order,
          p.name AS project_name,
          sp.created_at
        FROM solution_projects sp
        INNER JOIN projects p ON p.id = sp.project_id
        WHERE sp.solution_id = @solutionId
        ORDER BY sp.sort_order ASC, p.name ASC
      `);
            return statement.all({ solutionId }).map(mapSolutionProjectRow);
        },
        listProjectSolutionsByProjectId(projectId) {
            const statement = database.prepare(`
        SELECT
          sp.project_id,
          sp.solution_id,
          s.name AS solution_name,
          sp.sort_order,
          s.updated_at AS solution_updated_at
        FROM solution_projects sp
        INNER JOIN solutions s ON s.id = sp.solution_id
        WHERE sp.project_id = @projectId
        ORDER BY s.updated_at DESC, s.name ASC
      `);
            return statement.all({ projectId }).map(mapProjectSolutionRow);
        },
    };
}
//# sourceMappingURL=repo.js.map