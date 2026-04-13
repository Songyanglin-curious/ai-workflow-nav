<script setup lang="ts">
import { onMounted } from 'vue';

import { PageShell } from '../shared/components/index.js';
import {
  SolutionEditor,
  SolutionList,
  SolutionProjectBindingDialog,
  SolutionProjectsPanel,
  useSolutionsModule,
  type SolutionDraft,
} from '../modules/solutions/index.js';

const {
  items,
  keyword,
  category,
  selectedSolutionId,
  selectedSolution,
  draft,
  isCreating,
  solutionProjects,
  bindableProjects,
  selectedProjectSolutions,
  listLoading,
  detailLoading,
  projectsLoading,
  projectCatalogLoading,
  bindingRelationsLoading,
  saving,
  deleting,
  bindingPending,
  listError,
  detailError,
  projectsError,
  saveError,
  deleteError,
  bindingError,
  bindingDialogOpen,
  bindingDialogMode,
  bindingDraft,
  bindingTarget,
  initialize,
  refreshList,
  searchSolutions,
  selectSolution,
  startCreate,
  resetDraft,
  saveSolution,
  deleteCurrentSolution,
  refreshSolutionProjects,
  openBindingDialog,
  closeBindingDialog,
  updateBindingDraft,
  submitBindingDialog,
  removeBinding,
} = useSolutionsModule();

onMounted(() => {
  void initialize();
});

function updateDraft(nextDraft: SolutionDraft): void {
  draft.value = nextDraft;
}
</script>

<template>
  <PageShell title="方案管理" description="页面层只负责装配方案列表、元数据编辑，以及和项目之间的归属绑定入口。">
    <section class="solutions-page">
      <header class="solutions-page__hero">
        <div>
          <p class="solutions-page__eyebrow">Solutions</p>
          <h2>方案组织工作区</h2>
          <p>Solution 只承接组织和展示语义，不承载独立布局；这里集中完成方案 CRUD 与 Project 归属管理。</p>
        </div>

        <div class="solutions-page__stat">
          <span>当前数量</span>
          <strong>{{ items.length }}</strong>
        </div>
      </header>

      <div class="solutions-page__grid">
        <SolutionList
          v-model:keyword="keyword"
          v-model:category="category"
          :items="items"
          :selected-solution-id="selectedSolutionId"
          :loading="listLoading"
          :error="listError"
          @search="searchSolutions"
          @select="selectSolution"
          @create="startCreate"
          @refresh="refreshList({ preserveSelection: true })"
        />

        <div class="solutions-page__main">
          <SolutionEditor
            :solution="selectedSolution"
            :draft="draft"
            :is-creating="isCreating"
            :saving="saving"
            :deleting="deleting"
            :error="saveError || deleteError || detailError"
            @update:draft="updateDraft"
            @save="saveSolution"
            @reset="resetDraft"
            @create="startCreate"
            @delete="deleteCurrentSolution"
          />

          <SolutionProjectsPanel
            :solution-name="selectedSolution?.name ?? null"
            :items="solutionProjects"
            :loading="detailLoading || projectsLoading"
            :error="projectsError"
            :disabled="isCreating || !selectedSolutionId"
            @refresh="refreshSolutionProjects"
            @bind="openBindingDialog()"
            @manage="openBindingDialog"
          />
        </div>
      </div>
    </section>

    <SolutionProjectBindingDialog
      :open="bindingDialogOpen"
      :mode="bindingDialogMode"
      :solution-name="selectedSolution?.name || '当前方案'"
      :draft="bindingDraft"
      :target="bindingTarget"
      :project-options="bindableProjects"
      :project-solutions="selectedProjectSolutions"
      :project-relations-loading="bindingRelationsLoading"
      :project-catalog-loading="projectCatalogLoading"
      :pending="bindingPending"
      :error="bindingError"
      @update:draft="updateBindingDraft"
      @close="closeBindingDialog"
      @confirm="submitBindingDialog"
      @remove="removeBinding"
    />
  </PageShell>
</template>

<style scoped>
.solutions-page {
  display: grid;
  gap: 20px;
}

.solutions-page__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.1), transparent 28%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.solutions-page__eyebrow {
  margin: 0 0 6px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.solutions-page__hero h2 {
  margin: 0;
  font-size: 1.7rem;
}

.solutions-page__hero p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.solutions-page__stat {
  min-width: 130px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-align: right;
}

.solutions-page__stat span {
  display: block;
  color: #64748b;
  font-size: 0.84rem;
}

.solutions-page__stat strong {
  font-size: 1.8rem;
  color: #0f172a;
}

.solutions-page__grid {
  display: grid;
  grid-template-columns: minmax(320px, 380px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.solutions-page__main {
  display: grid;
  gap: 20px;
}

@media (max-width: 960px) {
  .solutions-page__grid,
  .solutions-page__hero {
    grid-template-columns: 1fr;
  }

  .solutions-page__hero {
    display: grid;
  }

  .solutions-page__stat {
    text-align: left;
  }
}
</style>
