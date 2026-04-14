import { simulateRequest } from './http'
import type { PromptRecord } from './types'
import { promptMocks } from '../pages/prompt/mock'

type PromptMutation = Pick<PromptRecord, 'title' | 'description' | 'category'>

const mockDatabase: PromptRecord[] = promptMocks.map((prompt) => ({ ...prompt }))

function clonePrompt(prompt: PromptRecord): PromptRecord {
  return { ...prompt }
}

function clonePrompts(prompts: PromptRecord[]) {
  return prompts.map(clonePrompt)
}

function formatNow() {
  const now = new Date()
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
  const time = [String(now.getHours()).padStart(2, '0'), String(now.getMinutes()).padStart(2, '0')].join(':')

  return `${date} ${time}`
}

function createFilePath(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_一-龥]/g, '')

  return `prompts/${slug || 'new-prompt'}.md`
}

export async function listPrompts() {
  return simulateRequest(clonePrompts(mockDatabase))
}

export async function createPrompt(payload: PromptMutation) {
  const created: PromptRecord = {
    id: `prompt-${Date.now()}`,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    filePath: createFilePath(payload.title),
    content: '',
    updatedAt: formatNow(),
  }

  mockDatabase.unshift(created)

  return simulateRequest(clonePrompt(created))
}

export async function updatePrompt(id: string, payload: PromptMutation) {
  const index = mockDatabase.findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error('未找到需要更新的提示词')
  }

  mockDatabase[index] = {
    ...mockDatabase[index],
    title: payload.title,
    description: payload.description,
    category: payload.category,
    filePath: createFilePath(payload.title),
    updatedAt: formatNow(),
  }

  return simulateRequest(clonePrompt(mockDatabase[index]))
}

export async function deletePrompt(id: string) {
  const index = mockDatabase.findIndex((item) => item.id === id)

  if (index === -1) {
    throw new Error('未找到需要删除的提示词')
  }

  mockDatabase.splice(index, 1)

  return simulateRequest(undefined)
}
