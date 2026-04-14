import type Database from 'better-sqlite3';

import { AppError } from '../../app/appError.js';
import { errorCodes } from '../../app/errorCodes.js';
import { queryPromptDetail, queryPromptList } from './prompts.repo.js';

type QueryPromptListInput = {
  keyword?: string;
  category?: string;
};

export function handleQueryPromptList(db: Database.Database, input: QueryPromptListInput) {
  return {
    items: queryPromptList(db, input),
  };
}

export function handleQueryPromptDetail(db: Database.Database, id: string) {
  const prompt = queryPromptDetail(db, id);

  if (!prompt) {
    throw new AppError({
      code: errorCodes.promptNotFound,
      message: '提示词不存在',
      statusCode: 404,
      details: {
        id,
      },
    });
  }

  return prompt;
}
