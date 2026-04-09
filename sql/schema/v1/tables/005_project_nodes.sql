CREATE TABLE IF NOT EXISTS project_nodes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'default',
  folder_path TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_nodes_project_id
  ON project_nodes (project_id);

CREATE INDEX IF NOT EXISTS idx_project_nodes_status
  ON project_nodes (status);

CREATE INDEX IF NOT EXISTS idx_project_nodes_name
  ON project_nodes (name);
