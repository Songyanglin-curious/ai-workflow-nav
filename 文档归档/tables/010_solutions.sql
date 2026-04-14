CREATE TABLE IF NOT EXISTS solutions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_solutions_name
  ON solutions (name);

CREATE INDEX IF NOT EXISTS idx_solutions_category
  ON solutions (category);
