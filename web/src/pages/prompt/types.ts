import type { PromptCategory, PromptRecord } from '../../services/types'

export type { PromptCategory, PromptRecord }

export interface PromptDraft {
  title: string
  description: string
  category: PromptCategory
}

export interface PromptCategoryOption {
  label: string
  value: PromptCategory
}
