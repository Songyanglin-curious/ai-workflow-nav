CREATE TABLE IF NOT EXISTS deliberations_records (
  id TEXT PRIMARY KEY,
  project_node_id TEXT NOT NULL UNIQUE,
  folder_path TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_node_id) REFERENCES project_nodes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_deliberations_records_folder_path
  ON deliberations_records (folder_path);

