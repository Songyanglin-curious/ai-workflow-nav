<script setup lang="ts">
import MermaidPreview from './MermaidPreview.vue';
import { type WorkflowDetail, type WorkflowDraft } from '../types.js';

const props = defineProps<{
  workflow: WorkflowDetail | null;
  draft: WorkflowDraft;
  saving?: boolean;
  deleting?: boolean;
}>();

const emit = defineEmits<{
  'update:draft': [draft: WorkflowDraft];
  save: [];
  reset: [];
  delete: [];
}>();

function patchDraft<K extends keyof WorkflowDraft>(key: K, value: WorkflowDraft[K]): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <section class="workflow-editor">
    <header class="workflow-editor__header">
      <div>
        <p class="workflow-editor__eyebrow">{{ workflow ? '编辑模式' : '新建模式' }}</p>
        <h2>{{ workflow ? workflow.name : '新建工作流' }}</h2>
      </div>

      <div class="workflow-editor__actions">
        <n-button @click="$emit('reset')">重置</n-button>
        <n-button type="primary" :loading="saving" @click="$emit('save')">
          {{ workflow ? '保存修改' : '创建工作流' }}
        </n-button>
        <n-button v-if="workflow" type="error" :disabled="deleting" @click="$emit('delete')">
          删除
        </n-button>
      </div>
    </header>

    <div v-if="workflow" class="workflow-editor__meta">
      <span>ID: {{ workflow.id }}</span>
      <span>更新时间: {{ workflow.updatedAt }}</span>
    </div>

    <div class="workflow-editor__body">
      <n-form label-placement="top" class="workflow-editor__form">
        <n-form-item label="名称">
          <n-input :value="draft.name" placeholder="工作流名称" @update:value="patchDraft('name', $event)" />
        </n-form-item>

        <n-form-item label="描述">
          <n-input
            :value="draft.description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="补充这条工作流的用途"
            @update:value="patchDraft('description', $event)"
          />
        </n-form-item>

        <n-form-item label="标签">
          <n-input :value="draft.tags" placeholder="用逗号分隔" @update:value="patchDraft('tags', $event)" />
        </n-form-item>

        <n-form-item label="分类">
          <n-input :value="draft.category" placeholder="如：自动化 / 审核 / 触发" @update:value="patchDraft('category', $event)" />
        </n-form-item>
      </n-form>

      <div class="workflow-editor__preview">
        <n-form label-placement="top">
          <n-form-item label="Mermaid 源码">
            <n-input
              :value="draft.mermaidSource"
              type="textarea"
              :autosize="{ minRows: 14, maxRows: 26 }"
              placeholder="flowchart TD\nA[开始] --> B[结束]"
              @update:value="patchDraft('mermaidSource', $event)"
            />
          </n-form-item>
        </n-form>

        <MermaidPreview :source="draft.mermaidSource" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.workflow-editor {
  display: grid;
  gap: 16px;
}

.workflow-editor__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.workflow-editor__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workflow-editor__header h2 {
  margin: 6px 0 0;
  font-size: 22px;
}

.workflow-editor__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.workflow-editor__meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: #8b7b6d;
  font-size: 12px;
}

.workflow-editor__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

.workflow-editor__form,
.workflow-editor__preview {
  min-width: 0;
}

.workflow-editor__preview {
  display: grid;
  gap: 14px;
}

@media (max-width: 1100px) {
  .workflow-editor__body {
    grid-template-columns: 1fr;
  }
}
</style>
