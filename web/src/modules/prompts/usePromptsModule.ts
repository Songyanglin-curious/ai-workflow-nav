import { computed, ref } from 'vue';

import type {
  CreatePromptRequest,
  PromptDetail,
  PromptListQuery,
  PromptSummary,
  UpdatePromptRequest,
} from '../../../../shared/prompts';

import { createPrompt, deletePrompt, getPrompt, listPrompts, updatePrompt } from './api';

export type PromptEditorMode = 'create' | 'edit';

export interface PromptFormState {
  name: string;
  description: string;
  tags: string;
  category: string;
  content: string;
}

export function createEmptyPromptForm(): PromptFormState {
  return {
    name: '',
    description: '',
    tags: '',
    category: '',
    content: '',
  };
}

export function toPromptFormState(prompt: PromptDetail): PromptFormState {
  return {
    name: prompt.name,
    description: prompt.description,
    tags: prompt.tags,
    category: prompt.category,
    content: prompt.content,
  };
}

function toCreatePromptRequest(form: PromptFormState): CreatePromptRequest {
  return {
    name: form.name,
    description: form.description,
    tags: form.tags,
    category: form.category,
    content: form.content,
  };
}

function toUpdatePromptRequest(form: PromptFormState): UpdatePromptRequest {
  return {
    name: form.name,
    description: form.description,
    tags: form.tags,
    category: form.category,
    content: form.content,
  };
}

function toPromptQuery(keyword: string, category: string): PromptListQuery {
  const trimmedKeyword = keyword.trim();
  const trimmedCategory = category.trim();

  return {
    keyword: trimmedKeyword.length > 0 ? trimmedKeyword : undefined,
    category: trimmedCategory.length > 0 ? trimmedCategory : undefined,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '请求失败';
}

export function usePromptsModule() {
  const items = ref<PromptSummary[]>([]);
  const keyword = ref('');
  const category = ref('');
  const selectedPromptId = ref<string | null>(null);
  const selectedPrompt = ref<PromptDetail | null>(null);

  const listLoading = ref(false);
  const detailLoading = ref(false);
  const editorPending = ref(false);
  const deletePending = ref(false);

  const listError = ref<string | null>(null);
  const detailError = ref<string | null>(null);
  const editorError = ref<string | null>(null);
  const deleteError = ref<string | null>(null);

  const editorOpen = ref(false);
  const editorMode = ref<PromptEditorMode>('create');
  const editorDraft = ref<PromptFormState>(createEmptyPromptForm());

  const deleteOpen = ref(false);
  const deleteTarget = ref<PromptDetail | null>(null);

  const promptCount = computed(() => items.value.length);

  function clearSelection() {
    selectedPromptId.value = null;
    selectedPrompt.value = null;
    detailError.value = null;
    detailLoading.value = false;
  }

  async function refreshList(options: { selectFirst?: boolean } = {}): Promise<void> {
    listLoading.value = true;
    listError.value = null;

    try {
      items.value = await listPrompts(toPromptQuery(keyword.value, category.value));

      if (options.selectFirst && items.value.length > 0) {
        await selectPrompt(items.value[0].id);
      }
    } catch (error) {
      listError.value = getErrorMessage(error);
    } finally {
      listLoading.value = false;
    }
  }

  async function initialize(): Promise<void> {
    await refreshList({ selectFirst: true });
  }

  async function searchPrompts(): Promise<void> {
    clearSelection();
    await refreshList({ selectFirst: true });
  }

  async function selectPrompt(promptId: string): Promise<void> {
    selectedPromptId.value = promptId;
    selectedPrompt.value = null;
    detailError.value = null;
    detailLoading.value = true;

    try {
      selectedPrompt.value = await getPrompt(promptId);
    } catch (error) {
      detailError.value = getErrorMessage(error);
    } finally {
      detailLoading.value = false;
    }
  }

  function openCreate(): void {
    editorMode.value = 'create';
    editorDraft.value = createEmptyPromptForm();
    editorError.value = null;
    editorOpen.value = true;
  }

  function openEdit(prompt: PromptDetail | null = selectedPrompt.value): void {
    if (!prompt) {
      return;
    }

    editorMode.value = 'edit';
    editorDraft.value = toPromptFormState(prompt);
    editorError.value = null;
    editorOpen.value = true;
  }

  function closeEditor(): void {
    editorOpen.value = false;
    editorError.value = null;
  }

  async function savePrompt(form: PromptFormState): Promise<void> {
    editorPending.value = true;
    editorError.value = null;

    try {
      const prompt =
        editorMode.value === 'create'
          ? await createPrompt(toCreatePromptRequest(form))
          : await updatePrompt(selectedPromptId.value as string, toUpdatePromptRequest(form));

      selectedPromptId.value = prompt.id;
      selectedPrompt.value = prompt;
      editorDraft.value = toPromptFormState(prompt);
      editorOpen.value = false;
      await refreshList();
    } catch (error) {
      editorError.value = getErrorMessage(error);
    } finally {
      editorPending.value = false;
    }
  }

  function requestDelete(prompt: PromptDetail | null = selectedPrompt.value): void {
    if (!prompt) {
      return;
    }

    deleteTarget.value = prompt;
    deleteError.value = null;
    deleteOpen.value = true;
  }

  function cancelDelete(): void {
    deleteOpen.value = false;
    deleteTarget.value = null;
    deleteError.value = null;
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget.value) {
      return;
    }

    deletePending.value = true;
    deleteError.value = null;

    try {
      await deletePrompt(deleteTarget.value.id);
      cancelDelete();
      clearSelection();
      await refreshList({ selectFirst: true });
    } catch (error) {
      deleteError.value = getErrorMessage(error);
    } finally {
      deletePending.value = false;
    }
  }

  return {
    items,
    keyword,
    category,
    promptCount,
    selectedPromptId,
    selectedPrompt,
    listLoading,
    detailLoading,
    editorPending,
    deletePending,
    listError,
    detailError,
    editorError,
    deleteError,
    editorOpen,
    editorMode,
    editorDraft,
    deleteOpen,
    deleteTarget,
    initialize,
    refreshList,
    searchPrompts,
    selectPrompt,
    openCreate,
    openEdit,
    closeEditor,
    savePrompt,
    requestDelete,
    cancelDelete,
    confirmDelete,
    clearSelection,
  };
}
