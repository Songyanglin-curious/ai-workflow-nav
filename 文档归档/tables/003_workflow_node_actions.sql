CREATE TABLE IF NOT EXISTS workflow_node_actions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  mermaid_node_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_ref TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (workflow_id, mermaid_node_id),
  FOREIGN KEY (workflow_id) REFERENCES workflows (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workflow_node_actions_workflow_id
  ON workflow_node_actions (workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_node_actions_action_type
  ON workflow_node_actions (action_type);
