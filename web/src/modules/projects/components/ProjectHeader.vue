<script setup lang="ts">
import { SectionCard } from '../../../shared/components/index.js';
import { formatProjectTime, type ProjectDraft } from '../useProjectsModule.js';
import type { ProjectDetail } from '../../../../../shared/projects/index.js';

const props = defineProps<{
  project: ProjectDetail | null;
  draft: ProjectDraft;
  isCreating: boolean;
  loading?: boolean;
  saving?: boolean;
}>();

const emit = defineEmits<{
  'update:draft': [draft: ProjectDraft];
  save: [];
  reset: [];
  create: [];
}>();

function patchDraft<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <SectionCard
    :title="isCreating ? '新建项目' : project?.name || '项目详情'"
    :description="isCreating ? '先补齐项目元数据，后续节点树与画布都将挂在这个项目下。' : '这里先承接项目主资源元数据，删除保护与节点能力后续独立接入。'"
  >
    <template #actions>
      <n-button @click="$emit('create')">切到新建</n-button>
      <n-button @click="$emit('reset')">重置</n-button>
      <n-button type="primary" :loading="saving" @click="$emit('save')">
        {{ isCreating ? '创建项目' : '保存修改' }}
      </n-button>
    </template>

    <div class="project-header">
      <div v-if="project && !isCreating" class="project-header__meta">
        <span>ID：{{ project.id }}</span>
        <span>创建时间：{{ formatProjectTime(project.createdAt) }}</span>
        <span>更新时间：{{ formatProjectTime(project.updatedAt) }}</span>
      </div>

      <n-form label-placement="top" class="project-header__form">
        <n-form-item label="项目名称">
          <n-input :value="draft.name" placeholder="输入项目名称" @update:value="patchDraft('name', $event)" />
        </n-form-item>

        <n-form-item label="项目描述">
          <n-input
            :value="draft.description"
            type="textarea"
            :autosize="{ minRows: 4, maxRows: 8 }"
            placeholder="说明这个项目当前承载的目标或范围"
            @update:value="patchDraft('description', $event)"
          />
        </n-form-item>

        <div class="project-header__form-grid">
          <n-form-item label="标签">
            <n-input :value="draft.tags" placeholder="用逗号分隔" @update:value="patchDraft('tags', $event)" />
          </n-form-item>

          <n-form-item label="分类">
            <n-input :value="draft.category" placeholder="例如 product / research" @update:value="patchDraft('category', $event)" />
          </n-form-item>
        </div>
      </n-form>
    </div>
  </SectionCard>
</template>

<style scoped>
.project-header {
  display: grid;
  gap: 16px;
}

.project-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  color: #8b7b6d;
  font-size: 12px;
}

.project-header__form {
  display: grid;
  gap: 4px;
}

.project-header__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 720px) {
  .project-header__form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
