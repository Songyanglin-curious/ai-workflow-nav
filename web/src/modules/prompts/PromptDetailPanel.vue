<script setup lang="ts">
import type { PromptDetail } from '../../../../shared/prompts';

interface Props {
  prompt: PromptDetail | null;
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

defineEmits<{
  edit: [];
  delete: [];
  close: [];
}>();
</script>

<template>
  <section class="prompt-detail-panel">
    <header class="prompt-detail-panel__header">
      <div>
        <p class="prompt-detail-panel__eyebrow">Prompt 详情</p>
        <h3>内容预览</h3>
      </div>

      <div v-if="prompt" class="prompt-detail-panel__actions">
        <button type="button" class="prompt-detail-panel__button" @click="$emit('edit')">
          编辑
        </button>
        <button type="button" class="prompt-detail-panel__button prompt-detail-panel__button--danger" @click="$emit('delete')">
          删除
        </button>
        <button type="button" class="prompt-detail-panel__button prompt-detail-panel__button--ghost" @click="$emit('close')">
          关闭
        </button>
      </div>
    </header>

    <p v-if="error" class="prompt-detail-panel__message prompt-detail-panel__message--error">
      {{ error }}
    </p>
    <p v-else-if="loading" class="prompt-detail-panel__message">
      正在加载 Prompt 详情...
    </p>
    <section v-else-if="prompt" class="prompt-detail-panel__body">
      <div class="prompt-detail-panel__meta">
        <div>
          <span>名称</span>
          <strong>{{ prompt.name }}</strong>
        </div>
        <div>
          <span>分类</span>
          <strong>{{ prompt.category || '未分类' }}</strong>
        </div>
        <div>
          <span>标签</span>
          <strong>{{ prompt.tags || '无标签' }}</strong>
        </div>
        <div>
          <span>更新时间</span>
          <strong>{{ prompt.updatedAt }}</strong>
        </div>
      </div>

      <div class="prompt-detail-panel__section">
        <h4>描述</h4>
        <p>{{ prompt.description || '暂无描述' }}</p>
      </div>

      <div class="prompt-detail-panel__section">
        <h4>正文</h4>
        <pre class="prompt-detail-panel__content">{{ prompt.content || '暂无内容' }}</pre>
      </div>
    </section>
    <p v-else class="prompt-detail-panel__message">
      先从左侧选择一个 Prompt。
    </p>
  </section>
</template>

<style scoped>
.prompt-detail-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.prompt-detail-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.prompt-detail-panel__eyebrow {
  margin: 0 0 4px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prompt-detail-panel__header h3,
.prompt-detail-panel__section h4 {
  margin: 0;
}

.prompt-detail-panel__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.prompt-detail-panel__button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #0f172a;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.prompt-detail-panel__button--ghost {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.prompt-detail-panel__button--danger {
  background: #b42318;
}

.prompt-detail-panel__message {
  margin: 0;
  color: #475569;
}

.prompt-detail-panel__message--error {
  color: #b42318;
}

.prompt-detail-panel__body {
  display: grid;
  gap: 16px;
}

.prompt-detail-panel__meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.prompt-detail-panel__meta div,
.prompt-detail-panel__section {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  padding: 14px;
  background: rgba(248, 250, 252, 0.85);
}

.prompt-detail-panel__meta span {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 0.85rem;
}

.prompt-detail-panel__meta strong {
  display: block;
  color: #0f172a;
  font-size: 0.98rem;
  word-break: break-word;
}

.prompt-detail-panel__section {
  display: grid;
  gap: 10px;
}

.prompt-detail-panel__section p {
  margin: 0;
  color: #334155;
  line-height: 1.7;
}

.prompt-detail-panel__content {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  color: #0f172a;
  line-height: 1.7;
}

@media (max-width: 820px) {
  .prompt-detail-panel__header {
    flex-direction: column;
  }

  .prompt-detail-panel__meta {
    grid-template-columns: 1fr;
  }
}
</style>
