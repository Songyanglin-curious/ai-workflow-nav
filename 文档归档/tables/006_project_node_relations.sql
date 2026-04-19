CREATE TABLE IF NOT EXISTS project_node_relations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_project_node_id TEXT NULL,
  child_project_node_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (project_id, child_project_node_id),
  UNIQUE (project_id, parent_project_node_id, child_project_node_id),
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
  FOREIGN KEY (parent_project_node_id) REFERENCES project_nodes (id) ON DELETE CASCADE,
  FOREIGN KEY (child_project_node_id) REFERENCES project_nodes (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_project_node_relations_project_parent_sort
  ON project_node_relations (project_id, parent_project_node_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_project_node_relations_child
  ON project_node_relations (child_project_node_id);
