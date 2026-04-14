CREATE TABLE IF NOT EXISTS solution_projects (
  id TEXT PRIMARY KEY,
  solution_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (solution_id, project_id),
  FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_solution_projects_solution_sort
  ON solution_projects (solution_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_solution_projects_project_id
  ON solution_projects (project_id);
