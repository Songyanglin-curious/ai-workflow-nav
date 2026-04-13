<script setup lang="ts">
import { reactive, watch } from 'vue';

import { createEmptyPromptForm, type PromptEditorMode, type PromptFormState } from './usePromptsModule';

interface Props {
  open: boolean;
  mode: PromptEditorMode;
  initialValue: PromptFormState;
  pending?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  pending: false,
  error: null,
});

const emit = defineEmits<{
  close: [];
  save: [value: PromptFormState];
}>();

const form = reactive<PromptFormState>(createEmptyPromptForm());

function syncForm(next: PromptFormState) {
  form.name = next.name;
  form.description = next.description;
  form.tags = next.tags;
  form.category = next.category;
  form.content = next.content;
}

watch(
  () => [props.open, props.mode, props.initialValue] as const,
  ([isOpen]) => {
    if (isOpen) {
      syncForm(props.initialValue);
    }
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>

<template>
  <div v-if="open" class="prompt-editor" @click.self="$emit('close')">
    <section class="prompt-editor__panel" role="dialog" aria-modal="true">
      <header class="prompt-editor__header">
        <div>
          <p class="prompt-editor__eyebrow">Prompt 编辑</p>
          <h3>{{ mode === 'create' ? '新建 Prompt' : '编辑 Prompt' }}</h3>
        </div>

        <button type="button" class="prompt-editor__button prompt-editor__button--ghost" @click="$emit('close')">
          关闭
        </button>
      </header>

      <p v-if="error" class="prompt-editor__message prompt-editor__message--error">
        {{ error }}
      </p>

      <form class="prompt-editor__form" @submit.prevent="$emit('save', { ...form })">
        <label class="prompt-editor__field">
          <span>名称</span>
          <input v-model="form.name" type="text" required />
        </label>

        <label class="prompt-editor__field">
          <span>描述</span>
          <input v-model="form.description" type="text" />
        </label>

        <label class="prompt-editor__field">
          <span>标签</span>
          <input v-model="form.tags" type="text" />
        </label>

        <label class="prompt-editor__field">
          <span>分类</span>
          <input v-model="form.category" type="text" />
        </label>

        <label class="prompt-editor__field">
          <span>正文</span>
          <textarea v-model="form.content" rows="10"></textarea>
        </label>

        <div class="prompt-editor__actions">
          <button type="button" class="prompt-editor__button prompt-editor__button--ghost" :disabled="pending" @click="$emit('close')">
            取消
          </button>
          <button type="submit" class="prompt-editor__button prompt-editor__button--primary" :disabled="pending">
            {{ pending ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.prompt-editor {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
}

.prompt-editor__panel {
  width: min(760px, 100%);
  max-height: min(90vh, 920px);
  overflow: auto;
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.26);
}

.prompt-editor__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.prompt-editor__eyebrow {
  margin: 0 0 4px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prompt-editor__header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.prompt-editor__form {
  display: grid;
  gap: 14px;
}

.prompt-editor__field {
  display: grid;
  gap: 6px;
  color: #334155;
}

.prompt-editor__field span {
  font-size: 0.92rem;
}

.prompt-editor__field input,
.prompt-editor__field textarea {
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 14px;
  padding: 11px 12px;
  background: #fff;
  color: inherit;
  font: inherit;
}

.prompt-editor__field textarea {
  resize: vertical;
}

.prompt-editor__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.prompt-editor__button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}

.prompt-editor__button--primary {
  background: #0f172a;
  color: #fff;
}

.prompt-editor__button--ghost {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.prompt-editor__message {
  margin: 0;
}

.prompt-editor__message--error {
  color: #b42318;
}

@media (max-width: 640px) {
  .prompt-editor {
    padding: 12px;
  }

  .prompt-editor__panel {
    padding: 16px;
  }
}
</style>
