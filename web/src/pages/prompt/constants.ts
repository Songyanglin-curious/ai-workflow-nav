import type { PromptCategoryOption, PromptDraft } from './types'

export const promptCategoryOptions: PromptCategoryOption[] = [
  { label: '写作', value: '写作' },
  { label: '编程', value: '编程' },
  { label: '营销', value: '营销' },
  { label: '研究', value: '研究' },
]

export const emptyPromptDraft: PromptDraft = {
  title: '',
  description: '',
  category: '写作',
}
