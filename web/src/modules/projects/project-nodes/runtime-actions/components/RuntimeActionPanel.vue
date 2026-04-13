<script setup lang="ts">
import { EmptyState, SectionCard } from '../../../../../shared/components/index.js';
import RuntimeActionSummary from './RuntimeActionSummary.vue';
import RuntimeTriggerButton from './RuntimeTriggerButton.vue';
import {
  describeRuntimeTriggerResult,
  type WorkflowRuntimeNodeDetail,
  type WorkflowRuntimeTriggerResult,
} from '../types.js';
import type { ProjectNodeDetail } from '../../../../../../../shared/project-nodes/index.js';

const props = withDefaults(
  defineProps<{
    node: ProjectNodeDetail | null;
    selectedWorkflowNodeId: string;
    detail: WorkflowRuntimeNodeDetail | null;
    triggerResult: WorkflowRuntimeTriggerResult | null;
    detailLoading?: boolean;
    triggerLoading?: boolean;
    error?: string | null;
    promptCopyStatus?: 'idle' | 'copied' | 'failed';
    promptCopyError?: string | null;
  }>(),
  {
    detailLoading: false,
    triggerLoading: false,
    error: null,
    promptCopyStatus: 'idle',
    promptCopyError: null,
  },
);

const emit = defineEmits<{
  refresh: [];
  trigger: [];
  retryCopy: [];
  'update:selectedWorkflowNodeId': [workflowNodeId: string];
}>();

function updateSelectedWorkflowNodeId(value: string): void {
  emit('update:selectedWorkflowNodeId', value);
}
</script>

<template>
  <SectionCard title="运行时动作" description="运行时动作挂在项目节点上下文下，使用本地 activeWorkflowNodeId 读取与触发。">
    <template #actions>
      <n-button size="small" :disabled="!node?.workflowId || !selectedWorkflowNodeId" @click="$emit('refresh')">
        刷新详情
      </n-button>
      <RuntimeTriggerButton
        :disabled="!detail?.action?.isExecutable"
        :loading="triggerLoading"
        @trigger="$emit('trigger')"
      />
    </template>

    <div class="runtime-action-panel">
      <EmptyState
        v-if="!node"
        title="还没有选中节点"
        description="先选择一个项目节点，再读取它在当前工作流上下文中的运行时动作。"
      />

      <EmptyState
        v-else-if="!node.workflowId"
        title="当前节点未绑定工作流"
        description="运行时动作依赖节点上的 workflow 绑定；先为当前节点配置 workflow。"
      />

      <template v-else>
        <n-form label-placement="top">
          <n-form-item label="当前 Mermaid 节点 ID">
            <n-input
              :value="selectedWorkflowNodeId"
              placeholder="在 T052 画布接入前，这里先手动指定当前选中的 Mermaid 节点 ID"
              @update:value="updateSelectedWorkflowNodeId"
            />
          </n-form-item>
        </n-form>

        <n-alert v-if="error" type="error" :bordered="false">
          {{ error }}
        </n-alert>

        <n-spin :show="detailLoading">
          <EmptyState
            v-if="!selectedWorkflowNodeId"
            title="还没有选中 Mermaid 节点"
            description="`activeWorkflowNodeId` 保存在前端本地运行时；当前先用手动输入完成最小闭环。"
          />

          <RuntimeActionSummary v-else-if="detail" :detail="detail" />
        </n-spin>

        <div v-if="triggerResult" class="runtime-action-panel__result">
          <n-alert type="success" :bordered="false">
            {{ describeRuntimeTriggerResult(triggerResult) }}
          </n-alert>

          <template v-if="triggerResult.actionType === 'prompt'">
            <n-alert v-if="promptCopyStatus === 'copied'" type="success" :bordered="false">
              Prompt 正文已复制到剪贴板。
            </n-alert>
            <n-alert v-else-if="promptCopyStatus === 'failed'" type="warning" :bordered="false">
              {{ promptCopyError || 'Prompt 已返回，但写入剪贴板失败。' }}
            </n-alert>

            <n-form label-placement="top">
              <n-form-item label="返回的 Prompt 正文">
                <n-input
                  :value="triggerResult.copyText"
                  type="textarea"
                  :autosize="{ minRows: 6, maxRows: 14 }"
                  readonly
                />
              </n-form-item>
            </n-form>

            <div class="runtime-action-panel__result-actions">
              <n-button secondary @click="$emit('retryCopy')">重新复制</n-button>
            </div>
          </template>
        </div>
      </template>
    </div>
  </SectionCard>
</template>

<style scoped>
.runtime-action-panel {
  display: grid;
  gap: 16px;
}

.runtime-action-panel__result {
  display: grid;
  gap: 12px;
}

.runtime-action-panel__result-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
