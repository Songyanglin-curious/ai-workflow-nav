CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  content_file_path TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prompts_name
  ON prompts (name);

CREATE INDEX IF NOT EXISTS idx_prompts_category
  ON prompts (category);
