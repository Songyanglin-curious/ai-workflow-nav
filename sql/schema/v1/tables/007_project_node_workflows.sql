CREATE TABLE IF NOT EXISTS project_node_workflows (
  id TEXT PRIMARY KEY,
  project_node_id TEXT NOT NULL UNIQUE,
  workflow_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_node_id) REFERENCES project_nodes (id) ON DELETE CASCADE,
  FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_node_workflows_workflow_id
  ON project_node_workflows (workflow_id);
