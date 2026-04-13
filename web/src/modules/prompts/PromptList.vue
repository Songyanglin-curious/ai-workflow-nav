<script setup lang="ts">
import type { PromptSummary } from '../../../../shared/prompts';

interface Props {
  items: PromptSummary[];
  selectedPromptId: string | null;
  keyword: string;
  category: string;
  loading?: boolean;
  error?: string | null;
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<{
  'update:keyword': [value: string];
  'update:category': [value: string];
  search: [];
  select: [promptId: string];
  create: [];
  refresh: [];
}>();

function updateKeyword(event: Event) {
  emit('update:keyword', (event.target as HTMLInputElement).value);
}

function updateCategory(event: Event) {
  emit('update:category', (event.target as HTMLInputElement).value);
}
</script>

<template>
  <section class="prompt-list">
    <header class="prompt-list__header">
      <div>
        <p class="prompt-list__eyebrow">Prompt 列表</p>
        <h3>内容库</h3>
      </div>

      <div class="prompt-list__actions">
        <button type="button" class="prompt-list__button" @click="$emit('create')">
          新建
        </button>
        <button type="button" class="prompt-list__button prompt-list__button--ghost" :disabled="loading" @click="$emit('refresh')">
          刷新
        </button>
      </div>
    </header>

    <form class="prompt-list__filters" @submit.prevent="$emit('search')">
      <label class="prompt-list__field">
        <span>关键词</span>
        <input :value="keyword" type="text" placeholder="按名称或描述筛选" @input="updateKeyword" />
      </label>

      <label class="prompt-list__field">
        <span>分类</span>
        <input :value="category" type="text" placeholder="按分类筛选" @input="updateCategory" />
      </label>

      <button type="submit" class="prompt-list__button prompt-list__button--primary">
        搜索
      </button>
    </form>

    <p v-if="error" class="prompt-list__message prompt-list__message--error">
      {{ error }}
    </p>
    <p v-else-if="loading" class="prompt-list__message">
      正在加载 Prompt 列表...
    </p>
    <p v-else-if="items.length === 0" class="prompt-list__message">
      当前没有可用的 Prompt。
    </p>

    <ul v-else class="prompt-list__items">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="prompt-list__item"
          :class="{ 'prompt-list__item--active': item.id === selectedPromptId }"
          @click="$emit('select', item.id)"
        >
          <div class="prompt-list__item-top">
            <strong>{{ item.name }}</strong>
            <span>{{ item.category || '未分类' }}</span>
          </div>
          <p>{{ item.description || '暂无描述' }}</p>
          <small>{{ item.tags || '无标签' }}</small>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.prompt-list {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.prompt-list__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.prompt-list__eyebrow {
  margin: 0 0 4px;
  color: #0f766e;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prompt-list__header h3 {
  margin: 0;
  font-size: 1.15rem;
}

.prompt-list__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.prompt-list__filters {
  display: grid;
  gap: 12px;
}

.prompt-list__field {
  display: grid;
  gap: 6px;
  color: #334155;
  font-size: 0.92rem;
}

.prompt-list__field input {
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 14px;
  padding: 10px 12px;
  background: #fff;
  color: inherit;
  font: inherit;
}

.prompt-list__button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #0f172a;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.prompt-list__button--ghost {
  background: rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.prompt-list__button--primary {
  justify-self: start;
}

.prompt-list__message {
  margin: 0;
  color: #475569;
}

.prompt-list__message--error {
  color: #b42318;
}

.prompt-list__items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.prompt-list__item {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  padding: 14px;
  background: rgba(248, 250, 252, 0.9);
  text-align: left;
  color: #0f172a;
  cursor: pointer;
}

.prompt-list__item--active {
  border-color: rgba(15, 118, 110, 0.45);
  background: rgba(240, 253, 250, 0.95);
}

.prompt-list__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.prompt-list__item p,
.prompt-list__item small {
  display: block;
  margin: 6px 0 0;
  color: #475569;
}

@media (max-width: 820px) {
  .prompt-list__header {
    flex-direction: column;
  }
}
</style>
