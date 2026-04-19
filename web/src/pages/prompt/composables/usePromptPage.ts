import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePromptStore } from '../../../stores/prompt.store'
import { copyText } from '../../../utils/clipboard'
import { isNonEmptyString } from '../../../utils/guards'
import { promptCategoryOptions } from '../constants'
import type { PromptDraft } from '../types'

function createSearchText(title: string, description: string) {
  return `${title} ${description}`
}

export function usePromptPage() {
  const promptStore = usePromptStore()
  const { items, selectedId, draft, isCreating, loading, saving, persistedSignature, selectedPrompt } =
    storeToRefs(promptStore)

  const keyword = ref('')
  const copyState = ref<'idle' | 'done'>('idle')
  const sidebarExpanded = ref(false)

  const filteredPrompts = computed(() => {
    const normalized = keyword.value.trim().toLowerCase()

    if (!normalized) {
      return items.value
    }

    return items.value.filter((item) =>
      createSearchText(item.title, item.description).toLowerCase().includes(normalized),
    )
  })

  const canSaveNewPrompt = computed(() => {
    if (!isCreating.value || !draft.value) {
      return false
    }

    return isNonEmptyString(draft.value.title) && isNonEmptyString(draft.value.description)
  })

  const canCopy = computed(() => Boolean(selectedPromptContent.value.trim()))
  const canDelete = computed(() => Boolean(selectedId.value))
  const selectedUpdatedAt = computed(() => selectedPrompt.value?.updatedAt ?? '')
  const selectedFilePath = computed(() => selectedPrompt.value?.filePath ?? '')
  const selectedPromptContent = computed(() => selectedPrompt.value?.content ?? '')
  const showDetail = computed(() => !sidebarExpanded.value)

  const statusText = computed(() => {
    if (isCreating.value) {
      return '新增中'
    }

    if (saving.value) {
      return '自动保存中'
    }

    if (selectedId.value) {
      return '已自动保存'
    }

    return '未选择'
  })

  watch(
    () =>
      JSON.stringify({
        selectedId: selectedId.value,
        isCreating: isCreating.value,
        draft: draft.value,
      }),
    (_value, _oldValue, onCleanup) => {
      if (!draft.value || isCreating.value || !selectedId.value || loading.value) {
        return
      }

      const currentSignature = JSON.stringify(draft.value)

      if (currentSignature === persistedSignature.value) {
        return
      }

      const timer = window.setTimeout(() => {
        void promptStore.syncCurrentPrompt()
      }, 240)

      onCleanup(() => {
        window.clearTimeout(timer)
      })
    },
    { flush: 'post' },
  )

  onMounted(() => {
    void promptStore.load()
  })

  async function handleCopy(content?: string) {
    const value = content ?? selectedPromptContent.value

    if (!value) {
      return
    }

    await copyText(value)
    copyState.value = 'done'
    window.setTimeout(() => {
      copyState.value = 'idle'
    }, 1200)
  }

  function handleCreate() {
    promptStore.startCreate()
    sidebarExpanded.value = false
  }

  function handleSelect(id: string) {
    promptStore.selectPrompt(id)
    sidebarExpanded.value = false
  }

  function handlePatchDraft(patch: Partial<PromptDraft>) {
    promptStore.patchDraft(patch)
  }

  async function handleSave() {
    await promptStore.saveNewPrompt()
  }

  async function handleDelete() {
    await promptStore.removeCurrentPrompt()
  }

  function handlePromptPathClick() {
    if (!selectedFilePath.value) {
      return
    }

    console.info('[prompt] 文件路径点击事件待接入接口', selectedFilePath.value)
  }

  function toggleSidebarExpanded() {
    sidebarExpanded.value = !sidebarExpanded.value
  }

  return {
    keyword,
    draft,
    loading,
    saving,
    isCreating,
    filteredPrompts,
    selectedId,
    selectedPrompt,
    selectedUpdatedAt,
    selectedFilePath,
    selectedPromptContent,
    sidebarExpanded,
    showDetail,
    categoryOptions: promptCategoryOptions,
    canCopy,
    canDelete,
    canSaveNewPrompt,
    copyDone: computed(() => copyState.value === 'done'),
    statusText,
    handleCopy,
    handleCreate,
    handleSelect,
    handlePatchDraft,
    handleSave,
    handleDelete,
    handlePromptPathClick,
    toggleSidebarExpanded,
  }
}
