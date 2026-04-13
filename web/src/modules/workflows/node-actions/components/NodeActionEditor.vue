<script setup lang="ts">
import {
  nodeActionTypeOptions,
  type NodeActionDraft,
  type NodeActionEditorMode,
  type PromptTargetOption,
} from '../types.js';

const props = withDefaults(
  defineProps<{
    open: boolean;
    mode: NodeActionEditorMode;
    draft: NodeActionDraft;
    nodeSuggestions: string[];
    promptOptions: PromptTargetOption[];
    promptLoading?: boolean;
    promptError?: string | null;
    saving?: boolean;
  }>(),
  {
    promptLoading: false,
    promptError: null,
    saving: false,
  },
);

const emit = defineEmits<{
  close: [];
  save: [];
  'update:draft': [draft: NodeActionDraft];
}>();

function patchDraft<K extends keyof NodeActionDraft>(key: K, value: NodeActionDraft[K]): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <n-modal :show="open" preset="card" :mask-closable="false" style="width: min(760px, calc(100vw - 32px))">
    <section class="node-action-editor">
      <header class="node-action-editor__header">
        <div>
          <p class="node-action-editor__eyebrow">Node Action</p>
          <h3>{{ mode === 'create' ? '新建节点动作绑定' : '编辑节点动作绑定' }}</h3>
        </div>

        <n-button quaternary circle @click="$emit('close')">
          ×
        </n-button>
      </header>

      <n-form label-placement="top">
        <n-form-item label="Mermaid 节点 ID">
          <n-input
            :value="draft.mermaidNodeId"
            :disabled="mode === 'edit'"
            placeholder="例如：node-analyze"
            @update:value="patchDraft('mermaidNodeId', $event)"
          />
        </n-form-item>

        <div v-if="nodeSuggestions.length > 0" class="node-action-editor__suggestions">
          <span>当前 Mermaid 检测到的节点：</span>
          <div class="node-action-editor__chip-list">
            <button
              v-for="nodeId in nodeSuggestions"
              :key="nodeId"
              type="button"
              class="node-action-editor__chip"
              :disabled="mode === 'edit'"
              @click="patchDraft('mermaidNodeId', nodeId)"
            >
              {{ nodeId }}
            </button>
          </div>
        </div>

        <n-form-item label="动作类型">
          <n-radio-group :value="draft.actionType" @update:value="patchDraft('actionType', $event)">
            <n-space>
              <n-radio-button v-for="option in nodeActionTypeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </n-radio-button>
            </n-space>
          </n-radio-group>
        </n-form-item>

        <n-form-item :label="draft.actionType === 'prompt' ? 'Prompt ID' : 'Tool Key'">
          <n-input
            :value="draft.targetRef"
            :placeholder="draft.actionType === 'prompt' ? '请输入 Prompt ID' : '请输入工具 key'"
            @update:value="patchDraft('targetRef', $event)"
          />
        </n-form-item>

        <div v-if="draft.actionType === 'prompt'" class="node-action-editor__prompt-area">
          <span>可选 Prompt 候选：</span>
          <p v-if="promptLoading" class="node-action-editor__helper">正在加载 Prompt 列表…</p>
          <p v-else-if="promptError" class="node-action-editor__error">{{ promptError }}</p>
          <div v-else-if="promptOptions.length > 0" class="node-action-editor__chip-list">
            <button
              v-for="option in promptOptions"
              :key="option.value"
              type="button"
              class="node-action-editor__chip"
              @click="patchDraft('targetRef', option.value)"
            >
              {{ option.label }}
              <small>{{ option.description }}</small>
            </button>
          </div>
          <p v-else class="node-action-editor__helper">当前还没有 Prompt，可先去 Prompt 页面创建。</p>
        </div>
      </n-form>

      <footer class="node-action-editor__footer">
        <n-button @click="$emit('close')">取消</n-button>
        <n-button type="primary" :loading="saving" @click="$emit('save')">
          {{ mode === 'create' ? '创建绑定' : '保存修改' }}
        </n-button>
      </footer>
    </section>
  </n-modal>
</template>

<style scoped>
.node-action-editor {
  display: grid;
  gap: 18px;
}

.node-action-editor__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.node-action-editor__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.node-action-editor__header h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.node-action-editor__suggestions,
.node-action-editor__prompt-area {
  display: grid;
  gap: 10px;
  margin-top: -6px;
}

.node-action-editor__chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.node-action-editor__chip {
  display: inline-grid;
  gap: 2px;
  padding: 8px 12px;
  border: 1px solid rgba(18, 113, 93, 0.18);
  border-radius: 999px;
  background: rgba(18, 113, 93, 0.06);
  color: #12715d;
  cursor: pointer;
}

.node-action-editor__chip small {
  color: #6f6255;
}

.node-action-editor__chip:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.node-action-editor__helper,
.node-action-editor__error {
  margin: 0;
  font-size: 13px;
}

.node-action-editor__helper {
  color: #6f6255;
}

.node-action-editor__error {
  color: #b42318;
}

.node-action-editor__footer {
  display: flex;
  justify-content: end;
  gap: 12px;
}
</style>
