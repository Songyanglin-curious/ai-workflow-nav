<script setup lang="ts">
import { computed } from 'vue';
import type { SelectOption } from 'naive-ui';

import { type ProjectNodeEditorMode, type ProjectNodeDraft } from '../store.js';
import type { ProjectNodeStatus } from '../../../../../../shared/project-nodes/index.js';

interface ParentOption {
  label: string;
  value: string | null;
}

interface WorkflowOption {
  label: string;
  value: string;
}

const rootParentOptionValue = '__root__';

const statusOptions: Array<{ label: string; value: ProjectNodeStatus }> = [
  { label: '默认', value: 'default' },
  { label: '待办', value: 'todo' },
  { label: '修复', value: 'fix' },
];

const props = withDefaults(
  defineProps<{
    open: boolean;
    mode: ProjectNodeEditorMode;
    draft: ProjectNodeDraft;
    parentOptions: ParentOption[];
    workflowOptions: WorkflowOption[];
    workflowLoading?: boolean;
    saving?: boolean;
  }>(),
  {
    workflowLoading: false,
    saving: false,
  },
);

const emit = defineEmits<{
  close: [];
  save: [];
  'update:draft': [draft: ProjectNodeDraft];
}>();

const parentSelectOptions = computed<SelectOption[]>(() =>
  props.parentOptions.map((item) => ({
    label: item.label,
    value: item.value ?? rootParentOptionValue,
  })),
);

const workflowSelectOptions = computed<SelectOption[]>(() =>
  props.workflowOptions.map((item) => ({
    label: item.label,
    value: item.value,
  })),
);

function patchDraft<K extends keyof ProjectNodeDraft>(key: K, value: ProjectNodeDraft[K]): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <n-modal :show="open" preset="card" :mask-closable="false" style="width: min(760px, calc(100vw - 32px))">
    <section class="node-editor">
      <header class="node-editor__header">
        <div>
          <p class="node-editor__eyebrow">Project Node</p>
          <h3>{{ mode === 'create' ? '新建节点' : '编辑节点' }}</h3>
        </div>

        <n-button quaternary circle @click="$emit('close')">
          ×
        </n-button>
      </header>

      <n-form label-placement="top">
        <n-form-item label="节点名称">
          <n-input :value="draft.name" placeholder="输入节点名称" @update:value="patchDraft('name', $event)" />
        </n-form-item>

        <n-form-item label="节点描述">
          <n-input
            :value="draft.description"
            type="textarea"
            :autosize="{ minRows: 3, maxRows: 6 }"
            placeholder="说明当前节点承载的工作上下文"
            @update:value="patchDraft('description', $event)"
          />
        </n-form-item>

        <div class="node-editor__grid">
          <n-form-item label="状态">
            <n-select
              :value="draft.status"
              :options="statusOptions"
              @update:value="(value: ProjectNodeStatus) => patchDraft('status', value)"
            />
          </n-form-item>

          <n-form-item label="父节点">
            <n-select
              :value="draft.parentNodeId ?? rootParentOptionValue"
              :options="parentSelectOptions"
              clearable
              @update:value="
                (value: string | null) =>
                  patchDraft('parentNodeId', value === rootParentOptionValue ? null : value)
              "
            />
          </n-form-item>

          <n-form-item label="工作流绑定">
            <n-select
              :value="draft.workflowId"
              :options="workflowSelectOptions"
              :loading="workflowLoading"
              clearable
              placeholder="可选"
              @update:value="(value: string | null) => patchDraft('workflowId', value)"
            />
          </n-form-item>

          <n-form-item label="排序">
            <n-input-number
              :value="draft.sortOrder"
              clearable
              style="width: 100%"
              @update:value="(value: number | null) => patchDraft('sortOrder', value)"
            />
          </n-form-item>
        </div>
      </n-form>

      <footer class="node-editor__footer">
        <n-button @click="$emit('close')">取消</n-button>
        <n-button type="primary" :loading="saving" @click="$emit('save')">
          {{ mode === 'create' ? '创建节点' : '保存修改' }}
        </n-button>
      </footer>
    </section>
  </n-modal>
</template>

<style scoped>
.node-editor {
  display: grid;
  gap: 18px;
}

.node-editor__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.node-editor__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.node-editor__header h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.node-editor__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.node-editor__footer {
  display: flex;
  justify-content: end;
  gap: 12px;
}

@media (max-width: 720px) {
  .node-editor__grid {
    grid-template-columns: 1fr;
  }
}
</style>
