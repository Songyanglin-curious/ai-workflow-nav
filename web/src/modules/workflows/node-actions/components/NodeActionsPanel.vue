<script setup lang="ts">
import { computed, toRef } from 'vue';

import { EmptyState } from '../../../../shared/components/index.js';
import { useWorkflowNodeActions } from '../composables.js';
import { extractMermaidNodeIds } from '../types.js';
import NodeActionEditor from './NodeActionEditor.vue';
import NodeActionList from './NodeActionList.vue';
import NodeActionSyncButton from './NodeActionSyncButton.vue';

const props = withDefaults(
  defineProps<{
    workflowId: string | null;
    mermaidSource?: string;
  }>(),
  {
    mermaidSource: '',
  },
);

const {
  items,
  loading,
  saving,
  deleting,
  syncing,
  error,
  editorOpen,
  editorMode,
  draft,
  deleteTarget,
  syncResult,
  promptOptions,
  promptLoading,
  promptError,
  loadNodeActions,
  openCreate,
  openEdit,
  closeEditor,
  saveNodeAction,
  requestDelete,
  cancelDelete,
  confirmDelete,
  syncBindings,
} = useWorkflowNodeActions(toRef(props, 'workflowId'));
const nodeSuggestions = computed(() => extractMermaidNodeIds(props.mermaidSource));
const deleteTargetName = computed(() => deleteTarget.value?.mermaidNodeId ?? '');
</script>

<template>
  <section class="node-actions-panel">
    <header class="node-actions-panel__header">
      <div>
        <p class="node-actions-panel__eyebrow">Node Actions</p>
        <h2>节点动作绑定</h2>
        <p>这里维护 Workflow 节点到 Prompt 或工具目标的绑定，不把过程语义塞回页面层。</p>
      </div>

      <div class="node-actions-panel__actions">
        <n-button size="small" :disabled="!workflowId" @click="loadNodeActions">刷新</n-button>
        <NodeActionSyncButton
          :pending="syncing"
          :disabled="!workflowId"
          :result="syncResult"
          @sync="syncBindings"
        />
        <n-button type="primary" :disabled="!workflowId" @click="openCreate">新建绑定</n-button>
      </div>
    </header>

    <n-alert v-if="error" type="error" :bordered="false">
      {{ error.message }}
    </n-alert>

    <EmptyState
      v-if="!workflowId"
      title="请先保存工作流"
      description="节点动作绑定依赖已存在的 Workflow。先创建或选中一条工作流，再继续维护节点动作。"
    />

    <template v-else>
      <div class="node-actions-panel__notice">
        <p>节点动作绑定基于已保存的 Mermaid 源码。若刚修改 Mermaid，请先保存工作流，再执行同步或新增绑定。</p>
      </div>

      <div v-if="nodeSuggestions.length > 0" class="node-actions-panel__nodes">
        <span>当前检测到的 Mermaid 节点：</span>
        <div class="node-actions-panel__chips">
          <span v-for="nodeId in nodeSuggestions" :key="nodeId" class="node-actions-panel__chip">
            {{ nodeId }}
          </span>
        </div>
      </div>

      <NodeActionList
        :items="items"
        :loading="loading"
        @create="openCreate"
        @edit="openEdit"
        @delete="requestDelete"
      />
    </template>

    <NodeActionEditor
      :open="editorOpen"
      :mode="editorMode"
      :draft="draft"
      :saving="saving"
      :node-suggestions="nodeSuggestions"
      :prompt-options="promptOptions"
      :prompt-loading="promptLoading"
      :prompt-error="promptError"
      @update:draft="draft = $event"
      @close="closeEditor"
      @save="saveNodeAction"
    />

    <n-modal :show="Boolean(deleteTarget)" preset="card" :mask-closable="false" style="width: 520px">
      <section class="node-actions-panel__delete-dialog">
        <h3>删除节点动作</h3>
        <p>确认删除节点 <strong>{{ deleteTargetName }}</strong> 的动作绑定吗？</p>

        <div class="node-actions-panel__delete-actions">
          <n-button @click="cancelDelete">取消</n-button>
          <n-button type="error" :loading="deleting" @click="confirmDelete">确认删除</n-button>
        </div>
      </section>
    </n-modal>
  </section>
</template>

<style scoped>
.node-actions-panel {
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgba(120, 92, 56, 0.14);
  border-radius: 24px;
  background: rgba(255, 250, 242, 0.72);
}

.node-actions-panel__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.node-actions-panel__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.node-actions-panel__header h2 {
  margin: 6px 0 8px;
  font-size: 24px;
}

.node-actions-panel__header p,
.node-actions-panel__notice p {
  margin: 0;
  color: #6f6255;
  line-height: 1.65;
}

.node-actions-panel__actions {
  display: flex;
  align-items: start;
  gap: 10px;
  flex-wrap: wrap;
}

.node-actions-panel__notice {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(18, 113, 93, 0.06);
}

.node-actions-panel__nodes {
  display: grid;
  gap: 10px;
}

.node-actions-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.node-actions-panel__chip {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(18, 113, 93, 0.08);
  color: #12715d;
  font-size: 12px;
}

.node-actions-panel__delete-dialog {
  display: grid;
  gap: 12px;
}

.node-actions-panel__delete-dialog h3,
.node-actions-panel__delete-dialog p {
  margin: 0;
}

.node-actions-panel__delete-dialog p {
  color: #6f6255;
  line-height: 1.65;
}

.node-actions-panel__delete-actions {
  display: flex;
  justify-content: end;
  gap: 12px;
}

@media (max-width: 960px) {
  .node-actions-panel__header {
    display: grid;
  }
}
</style>
