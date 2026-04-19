export type PromptCategory = '写作' | '编程' | '营销' | '研究'

export interface PromptRecord {
  id: string
  title: string
  description: string
  category: PromptCategory
  filePath: string
  content: string
  updatedAt: string
}
