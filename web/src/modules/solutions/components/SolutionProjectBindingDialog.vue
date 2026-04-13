<script setup lang="ts">
import type { ProjectSolutionItem, ProjectSummary, SolutionProjectItem } from '../../../../../shared/projects/index.js';
import type { SolutionBindingDialogMode, SolutionProjectBindingDraft } from '../composables.js';

const props = withDefaults(
  defineProps<{
    open: boolean;
    mode: SolutionBindingDialogMode;
    solutionName: string;
    draft: SolutionProjectBindingDraft;
    target: SolutionProjectItem | null;
    projectOptions: ProjectSummary[];
    projectSolutions: ProjectSolutionItem[];
    projectRelationsLoading?: boolean;
    pending?: boolean;
    projectCatalogLoading?: boolean;
    error?: string | null;
  }>(),
  {
    projectRelationsLoading: false,
    pending: false,
    projectCatalogLoading: false,
    error: null,
  },
);

const emit = defineEmits<{
  close: [];
  confirm: [];
  remove: [];
  'update:draft': [draft: SolutionProjectBindingDraft];
}>();

function patchDraft<K extends keyof SolutionProjectBindingDraft>(
  key: K,
  value: SolutionProjectBindingDraft[K],
): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <n-modal :show="open" preset="card" :mask-closable="false" style="width: min(760px, calc(100vw - 32px))">
    <section class="solution-project-binding-dialog">
      <header class="solution-project-binding-dialog__header">
        <div>
          <p class="solution-project-binding-dialog__eyebrow">Solution Projects</p>
          <h3>{{ mode === 'bind' ? '绑定项目到方案' : '管理方案项目绑定' }}</h3>
          <p>{{ solutionName }}</p>
        </div>

        <n-button quaternary circle @click="$emit('close')">
          ×
        </n-button>
      </header>

      <n-alert type="info" :bordered="false">
        一个项目可以同时属于多个方案；这里维护的只是当前方案下的归属关系和展示顺序。
      </n-alert>

      <n-form label-placement="top">
        <n-form-item label="目标项目">
          <n-select
            :value="draft.projectId"
            :options="projectOptions.map((item) => ({ label: item.name, value: item.id }))"
            :loading="projectCatalogLoading"
            :disabled="mode === 'manage'"
            placeholder="选择要绑定的项目"
            clearable
            @update:value="patchDraft('projectId', $event)"
          />
        </n-form-item>

        <n-form-item label="方案内排序">
          <n-input-number
            :value="draft.sortOrder"
            :min="0"
            placeholder="留空时由服务端追加到末尾"
            @update:value="patchDraft('sortOrder', $event)"
          />
        </n-form-item>
      </n-form>

      <n-spin :show="projectRelationsLoading">
        <div v-if="draft.projectId" class="solution-project-binding-dialog__relations">
          <strong>当前项目已归属的方案</strong>

          <p v-if="projectSolutions.length === 0">这个项目目前还没有归属到任何方案。</p>

          <ul v-else>
            <li v-for="item in projectSolutions" :key="`${item.projectId}-${item.solutionId}`">
              {{ item.solutionName }} · 排序 {{ item.sortOrder }}
            </li>
          </ul>
        </div>
      </n-spin>

      <p v-if="error" class="solution-project-binding-dialog__error">{{ error }}</p>

      <footer class="solution-project-binding-dialog__footer">
        <n-button v-if="mode === 'manage'" type="error" :loading="pending" @click="$emit('remove')">
          解绑当前项目
        </n-button>
        <div class="solution-project-binding-dialog__footer-actions">
          <n-button @click="$emit('close')">取消</n-button>
          <n-button type="primary" :loading="pending" @click="$emit('confirm')">
            {{ mode === 'bind' ? '创建绑定' : '保存排序' }}
          </n-button>
        </div>
      </footer>
    </section>
  </n-modal>
</template>

<style scoped>
.solution-project-binding-dialog {
  display: grid;
  gap: 18px;
}

.solution-project-binding-dialog__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.solution-project-binding-dialog__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.solution-project-binding-dialog__header h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.solution-project-binding-dialog__header p {
  margin: 8px 0 0;
  color: #6f6255;
}

.solution-project-binding-dialog__relations {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.82);
}

.solution-project-binding-dialog__relations strong {
  color: #3f3429;
}

.solution-project-binding-dialog__relations p,
.solution-project-binding-dialog__relations ul {
  margin: 0;
  color: #6f6255;
  line-height: 1.6;
}

.solution-project-binding-dialog__relations ul {
  padding-left: 18px;
}

.solution-project-binding-dialog__error {
  margin: 0;
  color: #b42318;
}

.solution-project-binding-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.solution-project-binding-dialog__footer-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 720px) {
  .solution-project-binding-dialog__footer {
    display: grid;
  }

  .solution-project-binding-dialog__footer-actions {
    justify-content: end;
  }
}
</style>
