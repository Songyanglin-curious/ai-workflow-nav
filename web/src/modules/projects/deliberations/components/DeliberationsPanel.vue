<script setup lang="ts">
import { computed } from 'vue';

import { useSessionStore } from '../../../../runtime/index.js';
import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import { useProjectNodeDeliberations } from '../composables.js';
import AppendLatestButton from './AppendLatestButton.vue';
import CreateDeliberationFileDialog from './CreateDeliberationFileDialog.vue';
import DeliberationsFileList from './DeliberationsFileList.vue';
import type { ProjectNodeDetail } from '../../../../../../shared/project-nodes/index.js';

const props = defineProps<{
  node: ProjectNodeDetail | null;
}>();
const sessionStore = useSessionStore();

const {
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
} = useProjectNodeDeliberations(computed(() => props.node));

function describeAppendResult(): string {
  if (!appendResult.value) {
    return '';
  }

  if (appendResult.value.createdNewFile) {
    return `当前没有合规的最新文件，系统已先创建 ${appendResult.value.fileName} 并完成追加。`;
  }

  return `已把剪贴板内容追加到 ${appendResult.value.fileName}。`;
}

function describeCreateResult(): string {
  if (!createResult.value) {
    return '';
  }

  return `已创建新的推敲记录文件：${createResult.value.fileName}。`;
}

async function handleRefresh(): Promise<void> {
  sessionStore.touch();
  await refresh();
}
</script>

<template>
  <SectionCard title="推敲记录" description="这里承接节点 deliberations 目录信息、文件列表、追加到最新文件与手动新建。">
    <template #actions>
      <n-button size="small" :disabled="!node" @click="handleRefresh">刷新列表</n-button>
      <AppendLatestButton :disabled="!node" :loading="appendLoading" @append="appendFromClipboard" />
      <n-button size="small" :disabled="!node" @click="openCreateDialog">新建文件</n-button>
    </template>

    <div class="deliberations-panel">
      <EmptyState
        v-if="!node"
        title="还没有选中节点"
        description="先选择一个项目节点，再查看它的推敲记录目录和文件列表。"
      />

      <template v-else>
        <n-alert v-if="error" type="error" :bordered="false">
          {{ error.message }}
        </n-alert>

        <n-alert v-if="appendResult" type="success" :bordered="false">
          {{ describeAppendResult() }}
        </n-alert>

        <n-alert v-if="createResult" type="success" :bordered="false">
          {{ describeCreateResult() }}
        </n-alert>

        <n-spin :show="loading">
          <div v-if="folderInfo" class="deliberations-panel__stats">
            <article>
              <span>目录状态</span>
              <strong>{{ folderInfo.exists ? '磁盘目录已存在' : '磁盘目录暂未落地' }}</strong>
            </article>
            <article>
              <span>文件数量</span>
              <strong>{{ folderInfo.fileCount }}</strong>
            </article>
            <article>
              <span>最新可写文件</span>
              <strong>{{ folderInfo.latestWritableFileName || '当前还没有合规文件' }}</strong>
            </article>
          </div>

          <n-alert v-if="folderInfo && !folderInfo.exists" type="info" :bordered="false">
            当前只有目录入口记录，磁盘目录会在首次追加或首次新建文件时自动补齐。
          </n-alert>

          <p class="deliberations-panel__note">
            默认追加目标只看合规文件名里的时间戳；命名不合规的文件会展示出来，但不会被当作默认写入目标。
          </p>

          <DeliberationsFileList :items="files" :loading="loading" />
        </n-spin>
      </template>
    </div>

    <CreateDeliberationFileDialog
      :open="createDialogOpen"
      :title-draft="createTitleDraft"
      :loading="createLoading"
      :error="error?.message ?? null"
      @update:title-draft="createTitleDraft = $event"
      @close="closeCreateDialog"
      @confirm="createFile"
    />
  </SectionCard>
</template>

<style scoped>
.deliberations-panel {
  display: grid;
  gap: 14px;
}

.deliberations-panel__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.deliberations-panel__stats article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.deliberations-panel__stats span {
  color: #8b7b6d;
  font-size: 12px;
}

.deliberations-panel__stats strong {
  color: #3f3429;
  word-break: break-all;
}

.deliberations-panel__note {
  margin: 0;
  color: #6f6255;
  line-height: 1.65;
}

@media (max-width: 720px) {
  .deliberations-panel__stats {
    grid-template-columns: 1fr;
  }
}
</style>
