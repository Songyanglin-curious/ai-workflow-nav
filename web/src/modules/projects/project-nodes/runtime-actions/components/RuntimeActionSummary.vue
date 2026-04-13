<script setup lang="ts">
import {
  describeRuntimeDetail,
  describeRuntimeFailureReason,
  runtimeActionTypeLabels,
  type WorkflowRuntimeNodeDetail,
} from '../types.js';

defineProps<{
  detail: WorkflowRuntimeNodeDetail | null;
}>();
</script>

<template>
  <div v-if="detail" class="runtime-action-summary">
    <div class="runtime-action-summary__grid">
      <article>
        <span>Mermaid 节点</span>
        <strong>{{ detail.mermaidNodeId }}</strong>
      </article>
      <article>
        <span>是否有绑定</span>
        <strong>{{ detail.hasBinding ? '有' : '无' }}</strong>
      </article>
      <article>
        <span>工作流 ID</span>
        <strong>{{ detail.workflowId }}</strong>
      </article>
    </div>

    <n-alert
      v-if="detail.action"
      :type="detail.action.isExecutable ? 'success' : 'warning'"
      :bordered="false"
    >
      <template #header>
        {{ runtimeActionTypeLabels[detail.action.actionType] }} · {{ detail.action.targetName }}
      </template>
      {{ detail.action.isExecutable ? describeRuntimeDetail(detail) : describeRuntimeFailureReason(detail.action.failureReason) }}
    </n-alert>

    <n-alert v-else type="info" :bordered="false">
      {{ describeRuntimeDetail(detail) }}
    </n-alert>

    <dl v-if="detail.action" class="runtime-action-summary__meta">
      <div>
        <dt>动作类型</dt>
        <dd>{{ runtimeActionTypeLabels[detail.action.actionType] }}</dd>
      </div>
      <div>
        <dt>目标引用</dt>
        <dd>{{ detail.action.targetRef }}</dd>
      </div>
      <div>
        <dt>目标名称</dt>
        <dd>{{ detail.action.targetName }}</dd>
      </div>
      <div>
        <dt>可执行</dt>
        <dd>{{ detail.action.isExecutable ? '可执行' : '不可执行' }}</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.runtime-action-summary {
  display: grid;
  gap: 14px;
}

.runtime-action-summary__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.runtime-action-summary__grid article,
.runtime-action-summary__meta div {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.runtime-action-summary__grid span,
.runtime-action-summary__meta dt {
  color: #8b7b6d;
  font-size: 12px;
}

.runtime-action-summary__grid strong,
.runtime-action-summary__meta dd {
  margin: 0;
  color: #3f3429;
  word-break: break-all;
}

.runtime-action-summary__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

@media (max-width: 720px) {
  .runtime-action-summary__grid,
  .runtime-action-summary__meta {
    grid-template-columns: 1fr;
  }
}
</style>
