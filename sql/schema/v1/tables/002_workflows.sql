CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  mermaid_source TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workflows_name
  ON workflows (name);

CREATE INDEX IF NOT EXISTS idx_workflows_category
  ON workflows (category);
