<script setup lang="ts">
import type { PromptDetail } from '../../../../shared/prompts';

interface Props {
  open: boolean;
  prompt: PromptDetail | null;
  pending?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), {
  pending: false,
  error: null,
});

defineEmits<{
  cancel: [];
  confirm: [];
}>();
</script>

<template>
  <div v-if="open" class="prompt-delete-dialog" @click.self="$emit('cancel')">
    <section class="prompt-delete-dialog__panel" role="dialog" aria-modal="true">
      <header class="prompt-delete-dialog__header">
        <div>
          <p class="prompt-delete-dialog__eyebrow">Prompt 删除</p>
          <h3>确认删除</h3>
        </div>
      </header>

      <p class="prompt-delete-dialog__message">
        将删除 <strong>{{ prompt?.name || '当前 Prompt' }}</strong>，这个操作不可撤销。
      </p>

      <p v-if="error" class="prompt-delete-dialog__message prompt-delete-dialog__message--error">
        {{ error }}
      </p>

      <div class="prompt-delete-dialog__actions">
        <button type="button" class="prompt-delete-dialog__button prompt-delete-dialog__button--ghost" :disabled="pending" @click="$emit('cancel')">
          取消
        </button>
        <button type="button" class="prompt-delete-dialog__button prompt-delete-dialog__button--danger" :disabled="pending" @click="$emit('confirm')">
          {{ pending ? '删除中...' : '确认删除' }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.prompt-delete-dialog {
  position: fixed;
  inset: 0;
  z-index: 25;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
}

.prompt-delete-dialog__panel {
  width: min(520px, 100%);
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.26);
}

.prompt-delete-dialog__eyebrow {
  margin: 0 0 4px;
  color: #b42318;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prompt-delete-dialog__header h3 {
  margin: 0;
}

.prompt-delete-dialog__message {
  margin: 0;
  color: #334155;
  line-height: 1.7;
}

.prompt-delete-dialog__message--error {
  color: #b42318;
}

.prompt-delete-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.prompt-delete-dialog__button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  cursor: pointer;
}

.prompt-delete-dialog__button--ghost {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.prompt-delete-dialog__button--danger {
  background: #b42318;
  color: #fff;
}
</style>
