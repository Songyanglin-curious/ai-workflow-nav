import { defineStore } from 'pinia'
import { emptyPromptDraft } from '../pages/prompt/constants'
import type { PromptDraft, PromptRecord } from '../pages/prompt/types'
import {
  createPrompt,
  deletePrompt,
  listPrompts,
  updatePrompt,
} from '../services/prompt.service'

interface PromptState {
  items: PromptRecord[]
  selectedId: string | null
  draft: PromptDraft | null
  isCreating: boolean
  loading: boolean
  saving: boolean
  persistedSignature: string
}

function toDraft(prompt: PromptRecord): PromptDraft {
  return {
    title: prompt.title,
    description: prompt.description,
    category: prompt.category,
  }
}

function createEmptyDraft(): PromptDraft {
  return { ...emptyPromptDraft }
}

function serializeDraft(draft: PromptDraft | null) {
  return JSON.stringify(draft)
}

export const usePromptStore = defineStore('prompt', {
  state: (): PromptState => ({
    items: [],
    selectedId: null,
    draft: null,
    isCreating: false,
    loading: false,
    saving: false,
    persistedSignature: '',
  }),

  getters: {
    selectedPrompt(state) {
      return state.items.find((item) => item.id === state.selectedId) ?? null
    },
  },

  actions: {
    async load() {
      this.loading = true

      try {
        this.items = await listPrompts()

        if (this.items.length > 0) {
          this.selectPrompt(this.items[0].id)
        } else {
          this.clearSelection()
        }
      } finally {
        this.loading = false
      }
    },

    selectPrompt(id: string) {
      const target = this.items.find((item) => item.id === id)

      if (!target) {
        return
      }

      this.selectedId = id
      this.isCreating = false
      this.draft = toDraft(target)
      this.persistedSignature = serializeDraft(this.draft)
    },

    clearSelection() {
      this.selectedId = null
      this.isCreating = false
      this.draft = null
      this.persistedSignature = serializeDraft(this.draft)
    },

    startCreate() {
      this.selectedId = null
      this.isCreating = true
      this.draft = createEmptyDraft()
      this.persistedSignature = serializeDraft(this.draft)
    },

    patchDraft(patch: Partial<PromptDraft>) {
      if (!this.draft) {
        return
      }

      this.draft = {
        ...this.draft,
        ...patch,
      }
    },

    async saveNewPrompt() {
      if (!this.isCreating || !this.draft) {
        return
      }

      this.saving = true

      try {
        const created = await createPrompt(this.draft)
        this.items.unshift(created)
        this.isCreating = false
        this.selectedId = created.id
        this.draft = toDraft(created)
        this.persistedSignature = serializeDraft(this.draft)
      } finally {
        this.saving = false
      }
    },

    async syncCurrentPrompt() {
      if (this.isCreating || !this.selectedId || !this.draft) {
        return
      }

      if (serializeDraft(this.draft) === this.persistedSignature) {
        return
      }

      this.saving = true

      try {
        const updated = await updatePrompt(this.selectedId, this.draft)
        this.items = this.items.map((item) => (item.id === updated.id ? updated : item))
        this.persistedSignature = serializeDraft(this.draft)
      } finally {
        this.saving = false
      }
    },

    async removeCurrentPrompt() {
      if (!this.selectedId) {
        this.clearSelection()
        return
      }

      const removedId = this.selectedId

      this.saving = true

      try {
        await deletePrompt(removedId)
        this.items = this.items.filter((item) => item.id !== removedId)

        if (this.items.length > 0) {
          this.selectPrompt(this.items[0].id)
        } else {
          this.clearSelection()
        }
      } finally {
        this.saving = false
      }
    },
  },
})
