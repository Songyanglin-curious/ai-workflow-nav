CREATE TABLE IF NOT EXISTS project_viewports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  viewport_x REAL NOT NULL,
  viewport_y REAL NOT NULL,
  zoom REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_viewports_project_id
  ON project_viewports (project_id);
