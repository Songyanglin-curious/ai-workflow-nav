import type { SqliteDatabase } from '../../infra/db/index.js';

export interface SolutionRecord {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  projectCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionQuery {
  keyword?: string;
  category?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  updatedAt: string;
}

export interface SolutionProjectRecord {
  id: string;
  solutionId: string;
  projectId: string;
  sortOrder: number;
  projectName: string;
  createdAt: string;
}

export interface ProjectSolutionRecord {
  projectId: string;
  solutionId: string;
  solutionName: string;
  sortOrder: number;
  solutionUpdatedAt: string;
}

interface SolutionRow {
  id: string;
  name: string;
  description: string;
  tags: string;
  category: string;
  project_count: number;
  created_at: string;
  updated_at: string;
}

interface ProjectRow {
  id: string;
  name: string;
  updated_at: string;
}

interface SolutionProjectRow {
  id: string;
  solution_id: string;
  project_id: string;
  sort_order: number;
  project_name: string;
  created_at: string;
}

interface ProjectSolutionRow {
  project_id: string;
  solution_id: string;
  solution_name: string;
  sort_order: number;
  solution_updated_at: string;
}

function mapSolutionRow(row: SolutionRow): SolutionRecord {
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

function mapProjectRow(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
  };
}

function mapSolutionProjectRow(row: SolutionProjectRow): SolutionProjectRecord {
  return {
    id: row.id,
    solutionId: row.solution_id,
    projectId: row.project_id,
    sortOrder: row.sort_order,
    projectName: row.project_name,
    createdAt: row.created_at,
  };
}

function mapProjectSolutionRow(row: ProjectSolutionRow): ProjectSolutionRecord {
  return {
    projectId: row.project_id,
    solutionId: row.solution_id,
    solutionName: row.solution_name,
    sortOrder: row.sort_order,
    solutionUpdatedAt: row.solution_updated_at,
  };
}

export function createSolutionRepo(database: SqliteDatabase) {
  return {
    listSolutions(query: SolutionQuery): SolutionRecord[] {
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
      const statement = database.prepare<SolutionRow>(`
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

    getSolutionById(id: string): SolutionRecord | undefined {
      const statement = database.prepare<SolutionRow>(`
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

    createSolution(record: SolutionRecord): SolutionRecord {
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

    updateSolution(record: SolutionRecord): SolutionRecord {
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

    deleteSolutionById(id: string): void {
      const statement = database.prepare(`
        DELETE FROM solutions
        WHERE id = @id
      `);

      statement.run({ id });
    },

    getProjectById(id: string): ProjectRecord | undefined {
      const statement = database.prepare<ProjectRow>(`
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

    getSolutionProjectBySolutionIdAndProjectId(
      solutionId: string,
      projectId: string,
    ): SolutionProjectRecord | undefined {
      const statement = database.prepare<SolutionProjectRow>(`
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

    getNextSolutionProjectSortOrder(solutionId: string): number {
      const statement = database.prepare<{ next_sort_order: number }>(`
        SELECT COALESCE(MAX(sort_order) + 1, 0) AS next_sort_order
        FROM solution_projects
        WHERE solution_id = @solutionId
      `);

      const row = statement.get({ solutionId });
      return row?.next_sort_order ?? 0;
    },

    createSolutionProject(record: SolutionProjectRecord): SolutionProjectRecord {
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

    updateSolutionProjectSortOrder(
      solutionId: string,
      projectId: string,
      sortOrder: number,
    ): void {
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

    deleteSolutionProjectBySolutionIdAndProjectId(solutionId: string, projectId: string): void {
      const statement = database.prepare(`
        DELETE FROM solution_projects
        WHERE solution_id = @solutionId AND project_id = @projectId
      `);

      statement.run({
        solutionId,
        projectId,
      });
    },

    listSolutionProjectsBySolutionId(solutionId: string): SolutionProjectRecord[] {
      const statement = database.prepare<SolutionProjectRow>(`
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

    listProjectSolutionsByProjectId(projectId: string): ProjectSolutionRecord[] {
      const statement = database.prepare<ProjectSolutionRow>(`
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

export type SolutionRepo = ReturnType<typeof createSolutionRepo>;
