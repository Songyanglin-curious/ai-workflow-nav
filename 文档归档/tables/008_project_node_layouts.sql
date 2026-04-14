CREATE TABLE IF NOT EXISTS project_node_layouts (
  id TEXT PRIMARY KEY,
  project_node_id TEXT NOT NULL UNIQUE,
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_node_id) REFERENCES project_nodes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_node_layouts_project_node_id
  ON project_node_layouts (project_node_id);
