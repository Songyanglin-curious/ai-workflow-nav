import { ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue';

import { useSessionStore } from '../../../runtime/index.js';
import {
  appendLatestDeliberations,
  createDeliberationsFile,
  getDeliberationsRecordFolderInfo,
  listDeliberationsRecordFiles,
} from './api.js';
import type {
  AppendLatestDeliberationsResult,
  CreateDeliberationsFileResult,
  DeliberationsRecordFileItem,
  DeliberationsRecordFolderInfo,
} from '../../../../../shared/deliberations/index.js';
import type { ProjectNodeDetail } from '../../../../../shared/project-nodes/index.js';

export interface UseProjectNodeDeliberationsState {
  loading: Ref<boolean>;
  appendLoading: Ref<boolean>;
  createLoading: Ref<boolean>;
  createDialogOpen: Ref<boolean>;
  createTitleDraft: Ref<string>;
  error: ShallowRef<Error | null>;
  folderInfo: Ref<DeliberationsRecordFolderInfo | null>;
  files: Ref<DeliberationsRecordFileItem[]>;
  appendResult: Ref<AppendLatestDeliberationsResult | null>;
  createResult: Ref<CreateDeliberationsFileResult | null>;
  refresh: () => Promise<void>;
  appendFromClipboard: () => Promise<AppendLatestDeliberationsResult | null>;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  createFile: () => Promise<CreateDeliberationsFileResult | null>;
}

async function readClipboardText(): Promise<string> {
  if (!navigator.clipboard) {
    throw new Error('当前浏览器环境不支持读取剪贴板');
  }

  return navigator.clipboard.readText();
}

function toCreateFileInput(titleDraft: string): { title?: string } {
  const title = titleDraft.trim();

  return title ? { title } : {};
}

export function useProjectNodeDeliberations(
  projectNode: Ref<ProjectNodeDetail | null>,
): UseProjectNodeDeliberationsState {
  const sessionStore = useSessionStore();

  const loading = ref(false);
  const appendLoading = ref(false);
  const createLoading = ref(false);
  const createDialogOpen = ref(false);
  const createTitleDraft = ref('');
  const error = shallowRef<Error | null>(null);
  const folderInfo = ref<DeliberationsRecordFolderInfo | null>(null);
  const files = ref<DeliberationsRecordFileItem[]>([]);
  const appendResult = ref<AppendLatestDeliberationsResult | null>(null);
  const createResult = ref<CreateDeliberationsFileResult | null>(null);

  function resetState(): void {
    loading.value = false;
    appendLoading.value = false;
    createLoading.value = false;
    createDialogOpen.value = false;
    createTitleDraft.value = '';
    error.value = null;
    folderInfo.value = null;
    files.value = [];
    appendResult.value = null;
    createResult.value = null;
  }

  async function refresh(): Promise<void> {
    const projectNodeId = projectNode.value?.id;

    error.value = null;

    if (!projectNodeId) {
      folderInfo.value = null;
      files.value = [];
      return;
    }

    loading.value = true;

    try {
      const [nextFolderInfo, nextFiles] = await Promise.all([
        getDeliberationsRecordFolderInfo(projectNodeId),
        listDeliberationsRecordFiles(projectNodeId),
      ]);

      folderInfo.value = nextFolderInfo;
      files.value = nextFiles;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('推敲记录加载失败');
    } finally {
      loading.value = false;
    }
  }

  async function appendFromClipboard(): Promise<AppendLatestDeliberationsResult | null> {
    const projectNodeId = projectNode.value?.id;

    if (!projectNodeId) {
      return null;
    }

    sessionStore.touch();
    appendLoading.value = true;
    error.value = null;
    appendResult.value = null;
    createResult.value = null;

    try {
      const content = await readClipboardText();
      const result = await appendLatestDeliberations(projectNodeId, { content });

      appendResult.value = result;
      await refresh();
      return result;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('推敲记录追加失败');
      throw error.value;
    } finally {
      appendLoading.value = false;
    }
  }

  function openCreateDialog(): void {
    if (!projectNode.value) {
      return;
    }

    sessionStore.touch();
    createDialogOpen.value = true;
    createTitleDraft.value = '';
    error.value = null;
  }

  function closeCreateDialog(): void {
    createDialogOpen.value = false;
    createTitleDraft.value = '';
  }

  async function createFile(): Promise<CreateDeliberationsFileResult | null> {
    const projectNodeId = projectNode.value?.id;

    if (!projectNodeId) {
      return null;
    }

    sessionStore.touch();
    createLoading.value = true;
    error.value = null;
    appendResult.value = null;
    createResult.value = null;

    try {
      const result = await createDeliberationsFile(projectNodeId, toCreateFileInput(createTitleDraft.value));

      createResult.value = result;
      closeCreateDialog();
      await refresh();
      return result;
    } catch (cause) {
      error.value = cause instanceof Error ? cause : new Error('推敲记录文件创建失败');
      throw error.value;
    } finally {
      createLoading.value = false;
    }
  }

  watch(
    () => projectNode.value?.id ?? null,
    () => {
      resetState();
      void refresh();
    },
    { immediate: true },
  );

  return {
    loading,
    appendLoading,
    createLoading,
    createDialogOpen,
    createTitleDraft,
    error,
    folderInfo,
    files,
    appendResult,
    createResult,
    refresh,
    appendFromClipboard,
    openCreateDialog,
    closeCreateDialog,
    createFile,
  };
}
