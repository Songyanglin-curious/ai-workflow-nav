CREATE TABLE IF NOT EXISTS insight_records (
  id TEXT PRIMARY KEY,
  project_node_id TEXT NOT NULL UNIQUE,
  folder_path TEXT NOT NULL UNIQUE,
  record_type TEXT NOT NULL DEFAULT 'summary',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_node_id) REFERENCES project_nodes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_insight_records_record_type
  ON insight_records (record_type);
