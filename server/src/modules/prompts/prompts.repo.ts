import type Database from 'better-sqlite3';

import type { PromptRecord } from './prompts.types.js';

type PromptRow = {
  id: string;
  name: string;
  description: string;
  category: string;
  content_file_path: string;
  created_at: string;
  updated_at: string;
};

type QueryPromptListInput = {
  keyword?: string;
  category?: string;
};

export function queryPromptList(db: Database.Database, input: QueryPromptListInput) {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (input.keyword) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${input.keyword}%`, `%${input.keyword}%`);
  }

  if (input.category) {
    conditions.push('category = ?');
    params.push(input.category);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT
      id,
      name,
      description,
      category,
      content_file_path,
      created_at,
      updated_at
    FROM prompts
    ${where}
    ORDER BY updated_at DESC, id DESC
  `;

  const rows = db.prepare(sql).all(...params) as PromptRow[];

  return rows.map(toPromptRecord);
}

export function queryPromptDetail(db: Database.Database, id: string) {
  const row = db
    .prepare(
      `
        SELECT
          id,
          name,
          description,
          category,
          content_file_path,
          created_at,
          updated_at
        FROM prompts
        WHERE id = ?
      `,
    )
    .get(id) as PromptRow | undefined;

  if (!row) {
    return null;
  }

  return toPromptRecord(row);
}

function toPromptRecord(row: PromptRow): PromptRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    contentFilePath: row.content_file_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
