import type { PromptRecord } from '../../services/types'

export const promptMocks: PromptRecord[] = [
  {
    id: 'prompt-1',
    title: '会议纪要整理',
    description: '适合将会议录音转写稿整理成结构化纪要，突出目标、决策、待办和风险。',
    category: '写作',
    filePath: 'prompts/meeting-summary.md',
    content:
      '请将下面的会议录音转写稿整理成结构化纪要，输出会议目标、关键决策、待办事项和风险提醒，并用简洁中文表达。',
    updatedAt: '2026-04-13 20:15',
  },
  {
    id: 'prompt-2',
    title: '代码审查助手',
    description: '从可维护性、边界条件、异常处理和测试覆盖四个角度审查代码变更。',
    category: '编程',
    filePath: 'prompts/code-review-assistant.md',
    content:
      '你是一位资深前端工程师，请从可维护性、边界条件、异常处理和测试覆盖四个角度审查下面的变更，并给出优先级明确的问题列表。',
    updatedAt: '2026-04-14 09:20',
  },
  {
    id: 'prompt-3',
    title: '产品文案精修',
    description: '用于优化产品介绍文案，让表达更自然可信，同时保留亮点和场景。',
    category: '营销',
    filePath: 'prompts/product-copy-polish.md',
    content:
      '请保留原意，对下面的产品介绍做精修。要求：更自然、更可信，避免空洞形容词，并保留功能亮点与使用场景。',
    updatedAt: '2026-04-12 18:42',
  },
  {
    id: 'prompt-4',
    title: '竞品研究提纲',
    description: '快速生成竞品研究提纲，聚焦用户、价值、路径、收费和差异化能力。',
    category: '研究',
    filePath: 'prompts/competitor-outline.md',
    content:
      '请基于给定竞品信息，生成一份研究提纲。包含：目标用户、核心价值、使用路径、收费方式、差异化能力和可借鉴点。',
    updatedAt: '2026-04-11 14:08',
  },
]
