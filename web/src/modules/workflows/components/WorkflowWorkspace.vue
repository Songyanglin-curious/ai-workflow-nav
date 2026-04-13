<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { EmptyState } from '../../../shared/components/index.js';
import { useWorkflows } from '../composables/useWorkflows.js';
import NodeActionsPanel from '../node-actions/components/NodeActionsPanel.vue';
import WorkflowDeleteDialog from './WorkflowDeleteDialog.vue';
import WorkflowEditor from './WorkflowEditor.vue';
import WorkflowList from './WorkflowList.vue';

const {
  items,
  selectedWorkflowId,
  selectedWorkflow,
  draft,
  loadingList,
  loadingDetail,
  saving,
  deleting,
  error,
  selectedSummary,
  isCreating,
  loadWorkflows,
  selectWorkflow,
  startCreateWorkflow,
  saveWorkflow,
  deleteSelectedWorkflow,
  resetDraft,
} = useWorkflows();
const deleteDialogOpen = ref(false);

const deleteTargetName = computed(() => selectedSummary.value?.name ?? selectedWorkflow.value?.name ?? '');

onMounted(() => {
  void loadWorkflows();
});

function handleDeleteRequest(): void {
  if (!selectedWorkflowId.value) {
    return;
  }

  deleteDialogOpen.value = true;
}

async function handleDeleteConfirm(): Promise<void> {
  if (!selectedWorkflowId.value) {
    return;
  }

  deleteDialogOpen.value = false;
  await deleteSelectedWorkflow(selectedWorkflowId.value);
}
</script>

<template>
  <section class="workflow-workspace">
    <header class="workflow-workspace__header">
      <div>
        <p class="workflow-workspace__eyebrow">Workflow 模块</p>
        <h1>工作流编辑与节点动作绑定</h1>
        <p>列表、编辑、Mermaid 预览和节点动作子模块都收拢在这里，页面层只保留装配入口。</p>
      </div>

      <div class="workflow-workspace__status">
        <span v-if="loadingList || loadingDetail">正在加载</span>
        <span v-else-if="isCreating">当前为新建模式</span>
        <span v-else>当前工作流已选中</span>
      </div>
    </header>

    <n-alert v-if="error" type="error" :bordered="false">
      {{ error.message }}
    </n-alert>

    <div class="workflow-workspace__grid">
      <WorkflowList
        :items="items"
        :selected-id="selectedWorkflowId"
        :loading="loadingList"
        @select="selectWorkflow"
        @create="startCreateWorkflow"
        @refresh="loadWorkflows"
      />

      <WorkflowEditor
        :workflow="selectedWorkflow"
        :draft="draft"
        :saving="saving"
        :deleting="deleting"
        @update:draft="draft = $event"
        @save="saveWorkflow"
        @reset="resetDraft"
        @delete="handleDeleteRequest"
      />
    </div>

    <NodeActionsPanel :workflow-id="selectedWorkflowId" :mermaid-source="selectedWorkflow?.mermaidSource ?? ''" />

    <EmptyState
      v-if="!selectedWorkflowId && items.length === 0"
      title="还没有工作流"
      description="先创建一条工作流，再在右侧完成 Mermaid 编辑与节点动作绑定。"
      action-label="新建工作流"
      @action="startCreateWorkflow"
    />

    <WorkflowDeleteDialog
      :open="deleteDialogOpen"
      :workflow-name="deleteTargetName"
      @cancel="deleteDialogOpen = false"
      @confirm="handleDeleteConfirm"
    />
  </section>
</template>

<style scoped>
.workflow-workspace {
  display: grid;
  gap: 20px;
}

.workflow-workspace__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.workflow-workspace__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workflow-workspace__header h1 {
  margin: 6px 0 8px;
  font-size: 32px;
}

.workflow-workspace__header p {
  max-width: 860px;
  margin: 0;
  color: #6f6255;
  line-height: 1.65;
}

.workflow-workspace__status {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(18, 113, 93, 0.08);
  color: #12715d;
  font-size: 12px;
  white-space: nowrap;
}

.workflow-workspace__grid {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

@media (max-width: 1200px) {
  .workflow-workspace__grid {
    grid-template-columns: 1fr;
  }
}
</style>
