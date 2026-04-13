<script setup lang="ts">
import { formatSolutionTime, type SolutionDraft } from '../composables.js';
import type { SolutionDetail } from '../../../../../shared/projects/index.js';

const props = defineProps<{
  solution: SolutionDetail | null;
  draft: SolutionDraft;
  isCreating: boolean;
  saving?: boolean;
  deleting?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  'update:draft': [draft: SolutionDraft];
  save: [];
  reset: [];
  create: [];
  delete: [];
}>();

function patchDraft<K extends keyof SolutionDraft>(key: K, value: SolutionDraft[K]): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <section class="solution-editor">
    <header class="solution-editor__header">
      <div>
        <p class="solution-editor__eyebrow">{{ isCreating ? '新建模式' : '编辑模式' }}</p>
        <h2>{{ isCreating ? '新建方案' : solution?.name || '方案详情' }}</h2>
      </div>

      <div class="solution-editor__actions">
        <n-button @click="$emit('create')">切到新建</n-button>
        <n-button @click="$emit('reset')">重置</n-button>
        <n-button type="primary" :loading="saving" @click="$emit('save')">
          {{ isCreating ? '创建方案' : '保存修改' }}
        </n-button>
        <n-popconfirm v-if="solution && !isCreating" @positive-click="$emit('delete')">
          <template #trigger>
            <n-button type="error" :loading="deleting">删除方案</n-button>
          </template>
          删除后只会移除方案本体及其绑定关系，不会删除任何项目。
        </n-popconfirm>
      </div>
    </header>

    <n-alert v-if="error" type="error" :bordered="false">
      {{ error }}
    </n-alert>

    <div v-if="solution && !isCreating" class="solution-editor__meta">
      <span>ID：{{ solution.id }}</span>
      <span>创建时间：{{ formatSolutionTime(solution.createdAt) }}</span>
      <span>更新时间：{{ formatSolutionTime(solution.updatedAt) }}</span>
      <span>当前项目数：{{ solution.projectCount }}</span>
    </div>

    <n-form label-placement="top" class="solution-editor__form">
      <n-form-item label="方案名称">
        <n-input :value="draft.name" placeholder="输入方案名称" @update:value="patchDraft('name', $event)" />
      </n-form-item>

      <n-form-item label="方案描述">
        <n-input
          :value="draft.description"
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 8 }"
          placeholder="说明这个方案聚合了哪些项目"
          @update:value="patchDraft('description', $event)"
        />
      </n-form-item>

      <div class="solution-editor__form-grid">
        <n-form-item label="标签">
          <n-input :value="draft.tags" placeholder="用逗号分隔" @update:value="patchDraft('tags', $event)" />
        </n-form-item>

        <n-form-item label="分类">
          <n-input :value="draft.category" placeholder="例如 product / research" @update:value="patchDraft('category', $event)" />
        </n-form-item>
      </div>
    </n-form>
  </section>
</template>

<style scoped>
.solution-editor {
  display: grid;
  gap: 16px;
}

.solution-editor__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.solution-editor__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.solution-editor__header h2 {
  margin: 6px 0 0;
  font-size: 22px;
}

.solution-editor__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: end;
}

.solution-editor__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #8b7b6d;
  font-size: 12px;
}

.solution-editor__form {
  display: grid;
  gap: 4px;
}

.solution-editor__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 720px) {
  .solution-editor__form-grid {
    grid-template-columns: 1fr;
  }

  .solution-editor__header {
    display: grid;
  }
}
</style>
