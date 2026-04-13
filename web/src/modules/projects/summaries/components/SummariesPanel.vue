<script setup lang="ts">
import { ref, watch } from 'vue';

import { useSessionStore } from '../../../../runtime/index.js';
import { EmptyState, SectionCard } from '../../../../shared/components/index.js';
import { getSummaryFolderInfo, listSummaryFiles } from '../api.js';
import SummaryFileList from './SummaryFileList.vue';
import type { ProjectNodeDetail } from '../../../../../../shared/project-nodes/index.js';
import type { SummaryFileItem, SummaryFolderInfo } from '../../../../../../shared/summaries/index.js';

const props = defineProps<{
  node: ProjectNodeDetail | null;
}>();

const sessionStore = useSessionStore();

const loading = ref(false);
const error = ref<Error | null>(null);
const folderInfo = ref<SummaryFolderInfo | null>(null);
const files = ref<SummaryFileItem[]>([]);

async function refresh(): Promise<void> {
  const projectNodeId = props.node?.id;

  error.value = null;

  if (!projectNodeId) {
    folderInfo.value = null;
    files.value = [];
    return;
  }

  loading.value = true;

  try {
    const [nextFolderInfo, nextFiles] = await Promise.all([
      getSummaryFolderInfo(projectNodeId),
      listSummaryFiles(projectNodeId),
    ]);

    folderInfo.value = nextFolderInfo;
    files.value = nextFiles;
  } catch (cause) {
    error.value = cause instanceof Error ? cause : new Error('总结目录加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleRefresh(): Promise<void> {
  sessionStore.touch();
  await refresh();
}

watch(
  () => props.node?.id ?? null,
  () => {
    folderInfo.value = null;
    files.value = [];
    error.value = null;
    void refresh();
  },
  { immediate: true },
);
</script>

<template>
  <SectionCard title="总结列表" description="这里承接节点 summaries 目录信息和文件列表展示；当前不提供自动写入或新建入口。">
    <template #actions>
      <n-button size="small" :disabled="!node" @click="handleRefresh">刷新列表</n-button>
    </template>

    <div class="summaries-panel">
      <EmptyState
        v-if="!node"
        title="还没有选中节点"
        description="先选择一个项目节点，再查看它的总结目录状态和文件列表。"
      />

      <template v-else>
        <n-alert v-if="error" type="error" :bordered="false">
          {{ error.message }}
        </n-alert>

        <n-spin :show="loading">
          <div v-if="folderInfo" class="summaries-panel__stats">
            <article>
              <span>目录状态</span>
              <strong>{{ folderInfo.exists ? '磁盘目录已存在' : '磁盘目录暂未落地' }}</strong>
            </article>
            <article>
              <span>文件数量</span>
              <strong>{{ folderInfo.fileCount }}</strong>
            </article>
            <article>
              <span>目录是否为空</span>
              <strong>{{ folderInfo.isEmpty ? '空目录' : '已有文件' }}</strong>
            </article>
          </div>

          <n-alert v-if="folderInfo && !folderInfo.exists" type="info" :bordered="false">
            当前只有目录入口记录，若磁盘目录缺失，这里不会隐式补建，只按只读语义直接展示状态。
          </n-alert>

          <p class="summaries-panel__note">
            总结目录主要用于人工整理结果；当前版本只展示目录信息与文件列表，不做“最新文件”判定，也不暴露自动写入动作。
          </p>

          <SummaryFileList :items="files" :loading="loading" />
        </n-spin>
      </template>
    </div>
  </SectionCard>
</template>

<style scoped>
.summaries-panel {
  display: grid;
  gap: 14px;
}

.summaries-panel__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.summaries-panel__stats article {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.summaries-panel__stats span {
  color: #8b7b6d;
  font-size: 12px;
}

.summaries-panel__stats strong {
  color: #3f3429;
  word-break: break-all;
}

.summaries-panel__note {
  margin: 0;
  color: #6f6255;
  line-height: 1.65;
}

@media (max-width: 720px) {
  .summaries-panel__stats {
    grid-template-columns: 1fr;
  }
}
</style>
