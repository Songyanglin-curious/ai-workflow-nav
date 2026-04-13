<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { EmptyState, PageShell, SectionCard } from '../../shared/components/index.js';
import { useSessionStore, useUiStore } from '../../runtime/index.js';
import ProjectHeader from './components/ProjectHeader.vue';
import ProjectList from './components/ProjectList.vue';
import ProjectSwitcher from './components/ProjectSwitcher.vue';
import DeliberationsPanel from './deliberations/components/DeliberationsPanel.vue';
import ProjectDeleteDialog from './deletion/components/ProjectDeleteDialog.vue';
import { useProjectDeletion } from './deletion/composables.js';
import NodeDetailPanel from './project-nodes/components/NodeDetailPanel.vue';
import NodeEditor from './project-nodes/components/NodeEditor.vue';
import ProjectNodeSidebarTree from './project-nodes/components/ProjectNodeSidebarTree.vue';
import { useProjectNodes } from './project-nodes/composables.js';
import NodeDeleteDialog from './project-nodes/deletion/components/NodeDeleteDialog.vue';
import { useProjectNodeDeletion } from './project-nodes/deletion/composables.js';
import RuntimeActionPanel from './project-nodes/runtime-actions/components/RuntimeActionPanel.vue';
import { useProjectNodeRuntimeActions } from './project-nodes/runtime-actions/composables.js';
import SummariesPanel from './summaries/components/SummariesPanel.vue';
import ProjectCanvas from './view-config/components/ProjectCanvas.vue';
import ViewportController from './view-config/components/ViewportController.vue';
import { useProjectViewConfig } from './view-config/composables.js';
import { useProjectsModule } from './useProjectsModule.js';

const sessionStore = useSessionStore();
const uiStore = useUiStore();

const {
  items,
  keyword,
  category,
  selectedProjectId,
  selectedProject,
  draft,
  loadingList,
  loadingDetail,
  saving,
  error,
  projectCount,
  isCreating,
  initialize,
  refreshList,
  searchProjects,
  selectProject,
  startCreateProject,
  saveProject,
  resetDraft,
} = useProjectsModule();
const projectIdRef = computed(() => selectedProjectId.value);
const {
  open: deleteDialogOpen,
  checking: deleteChecking,
  executing: deleteExecuting,
  error: deleteError,
  checkResult: deleteCheckResult,
  draft: deleteDraft,
  openDialog,
  closeDialog,
  executeDeletion,
} = useProjectDeletion(async () => {
  sessionStore.touch();
  await refreshList({ preserveSelection: false });
});
const {
  orderedTree,
  listLoading: nodeListLoading,
  workflowOptions,
  workflowLoading,
  selectedNodeId,
  selectedNodeDetail,
  detailLoading: nodeDetailLoading,
  editorOpen: nodeEditorOpen,
  editorMode: nodeEditorMode,
  draft: nodeDraft,
  saving: nodeSaving,
  errorText: nodeErrorText,
  parentOptions,
  loadNodes,
  selectNode,
  openCreateRoot,
  openCreateChild,
  openEditSelected,
  closeEditor: closeNodeEditor,
  saveNode,
} = useProjectNodes(projectIdRef);
const {
  open: nodeDeleteDialogOpen,
  checking: nodeDeleteChecking,
  executing: nodeDeleteExecuting,
  error: nodeDeleteError,
  checkResult: nodeDeleteCheckResult,
  draft: nodeDeleteDraft,
  openDialog: openNodeDeleteDialog,
  closeDialog: closeNodeDeleteDialog,
  executeDeletion: executeNodeDeletion,
} = useProjectNodeDeletion(async () => {
  sessionStore.setActiveWorkflowNodeId(null);
  sessionStore.setActiveProjectNodeId(null);
  await loadNodes();
});
const {
  selectedWorkflowNodeId,
  detailLoading: runtimeDetailLoading,
  triggerLoading: runtimeTriggerLoading,
  error: runtimeError,
  detail: runtimeDetail,
  triggerResult: runtimeTriggerResult,
  promptCopyStatus,
  promptCopyError,
  refreshDetail: refreshRuntimeDetail,
  triggerAction: triggerRuntimeAction,
  retryCopyPromptText,
} = useProjectNodeRuntimeActions(selectedNodeDetail);
const {
  canvasNodes,
  canvasEdges,
  layoutsLoading,
  layoutsSaving,
  viewportLoading,
  viewportSaving,
  error: viewConfigError,
  persistedViewport,
  defaultViewport,
  restoreViewport,
  restoreViewportVersion,
  currentViewport,
  saveNodeLayouts,
  recordViewport,
  saveCurrentViewport,
  restoreSavedViewport,
  restoreDefaultViewport,
} = useProjectViewConfig(projectIdRef, orderedTree, selectedNodeId);

const statusText = computed(() => {
  if (loadingList.value || loadingDetail.value) {
    return '正在同步项目资源';
  }

  if (isCreating.value) {
    return '当前处于新建模式';
  }

  return '当前项目已选中';
});

onMounted(() => {
  uiStore.setActivePanelId('projects-base');
  sessionStore.touch();
  void initialize();
});

function handleProjectSelect(projectId: string): void {
  sessionStore.touch();
  void selectProject(projectId);
}

function handleRefresh(): void {
  sessionStore.touch();
  void refreshList();
}

function handleSearch(): void {
  sessionStore.touch();
  void searchProjects();
}

async function handleSave(): Promise<void> {
  sessionStore.touch();
  await saveProject();
}

function handleNodeSelect(projectNodeId: string): void {
  sessionStore.touch();
  void selectNode(projectNodeId);
}

function handleCreateRootNode(): void {
  sessionStore.touch();
  openCreateRoot();
}

function handleCreateChildNode(parentNodeId: string | null): void {
  sessionStore.touch();
  openCreateChild(parentNodeId);
}

function handleEditNode(): void {
  sessionStore.touch();
  openEditSelected();
}

function handleDeleteNodeRequest(): void {
  if (!selectedNodeDetail.value) {
    return;
  }

  sessionStore.touch();
  void openNodeDeleteDialog(selectedNodeDetail.value.id);
}

async function handleSaveNode(): Promise<void> {
  sessionStore.touch();
  await saveNode();
}

async function handleDeleteNodeConfirm(): Promise<void> {
  sessionStore.touch();
  await executeNodeDeletion();
}

async function handleRuntimeRefresh(): Promise<void> {
  sessionStore.touch();
  await refreshRuntimeDetail();
}

async function handleRuntimeTrigger(): Promise<void> {
  sessionStore.touch();
  await triggerRuntimeAction();
}

async function handleCanvasLayoutCommit(
  items: Array<{ projectNodeId: string; positionX: number; positionY: number }>,
): Promise<void> {
  sessionStore.touch();
  await saveNodeLayouts(items);
}

function handleCanvasViewportChange(viewport: { x: number; y: number; zoom: number }): void {
  recordViewport(viewport);
}

async function handleSaveViewport(): Promise<void> {
  sessionStore.touch();
  await saveCurrentViewport();
}

function handleRestoreViewport(): void {
  sessionStore.touch();
  restoreSavedViewport();
}

function handleResetViewport(): void {
  sessionStore.touch();
  restoreDefaultViewport();
}

async function handleRetryCopyPrompt(): Promise<void> {
  sessionStore.touch();
  await retryCopyPromptText();
}

function handleDeleteRequest(): void {
  if (!selectedProject.value) {
    return;
  }

  sessionStore.touch();
  void openDialog(selectedProject.value.id);
}

async function handleDeleteConfirm(): Promise<void> {
  sessionStore.touch();
  await executeDeletion();
}
</script>

<template>
  <PageShell title="项目工作区基础资源" description="这一层先完成项目主资源列表、切换与基础元数据维护，为后续节点树和主画布提供稳定入口。">
    <div class="projects-workspace">
      <header class="projects-workspace__hero">
        <div>
          <p class="projects-workspace__eyebrow">Projects</p>
          <h2>项目主资源区块</h2>
          <p>当前只收敛项目列表、项目切换与基础元数据维护，不提前混入删除保护、节点树和主画布职责。</p>
        </div>

        <div class="projects-workspace__hero-side">
          <div class="projects-workspace__status">
            <span>{{ statusText }}</span>
            <strong>{{ projectCount }} 个项目</strong>
          </div>
          <div class="projects-workspace__runtime">
            <span>会话 {{ sessionStore.sessionId }}</span>
            <span>活动面板 {{ uiStore.activePanelId || '未设置' }}</span>
          </div>
        </div>
      </header>

      <n-alert v-if="error" type="error" :bordered="false">
        {{ error.message }}
      </n-alert>

      <ProjectSwitcher
        :items="items"
        :selected-project-id="selectedProjectId"
        :loading="loadingList"
        @select="handleProjectSelect"
        @refresh="handleRefresh"
      />

      <div class="projects-workspace__grid">
        <ProjectList
          v-model:keyword="keyword"
          v-model:category="category"
          :items="items"
          :selected-project-id="selectedProjectId"
          :loading="loadingList"
          @search="handleSearch"
          @select="handleProjectSelect"
          @create="startCreateProject"
          @refresh="handleRefresh"
        />

        <div class="projects-workspace__main">
          <ProjectHeader
            :project="selectedProject"
            :draft="draft"
            :is-creating="isCreating"
            :loading="loadingDetail"
            :saving="saving"
            @update:draft="draft = $event"
            @save="handleSave"
            @reset="resetDraft"
            @create="startCreateProject"
          />

          <SectionCard title="删除保护" description="项目删除属于独立过程能力，必须经过删除检查、策略选择与显式确认。">
            <template #actions>
              <n-button type="error" :disabled="!selectedProjectId" @click="handleDeleteRequest">
                删除当前项目
              </n-button>
            </template>

            <div class="projects-workspace__deletion-copy">
              <p>当前不会开放裸删除接口。这里仅挂接 `projects/deletion` 子模块，基础 CRUD 仍保持独立。</p>
              <p v-if="selectedProject">
                当前目标：<strong>{{ selectedProject.name }}</strong>
              </p>
              <p v-else>
                先选择一个已存在的项目，才能进入删除保护流程。
              </p>
            </div>
          </SectionCard>

          <div class="projects-workspace__workspace-grid">
            <ProjectNodeSidebarTree
              :items="orderedTree"
              :selected-node-id="selectedNodeId"
              :loading="nodeListLoading"
              @select="handleNodeSelect"
              @create-root="handleCreateRootNode"
            />

            <SectionCard title="主画布中心" description="ProjectCanvas 是主工作区唯一画布中心，布局与最终视角通过 view-config 独立读写。">
              <template #actions>
                <n-button size="small" type="primary" @click="handleCreateRootNode">新建根节点</n-button>
              </template>

              <n-alert v-if="nodeErrorText || viewConfigError" type="error" :bordered="false">
                {{ nodeErrorText || viewConfigError?.message }}
              </n-alert>

              <ViewportController
                :current-viewport="currentViewport"
                :persisted-viewport="persistedViewport"
                :loading="viewportLoading"
                :saving="viewportSaving"
                @save="handleSaveViewport"
                @restore="handleRestoreViewport"
                @reset="handleResetViewport"
              />

              <ProjectCanvas
                :nodes="canvasNodes"
                :edges="canvasEdges"
                :default-viewport="defaultViewport"
                :restore-viewport="restoreViewport"
                :restore-viewport-version="restoreViewportVersion"
                :saving-layouts="layoutsSaving || layoutsLoading"
                @select-node="handleNodeSelect"
                @commit-layouts="handleCanvasLayoutCommit"
                @viewport-change="handleCanvasViewportChange"
              />

              <p class="projects-workspace__canvas-note">
                当前持久化的是节点最终坐标与最终视角；`activeProjectNodeId` 和 `activeWorkflowNodeId` 仍留在前端本地 runtime。
              </p>
            </SectionCard>

            <div class="projects-workspace__detail-stack">
              <NodeDetailPanel
                :node="selectedNodeDetail"
                :loading="nodeDetailLoading"
                @edit="handleEditNode"
                @delete="handleDeleteNodeRequest"
                @create-root="handleCreateRootNode"
                @create-child="handleCreateChildNode"
              />

              <DeliberationsPanel :node="selectedNodeDetail" />

              <SummariesPanel :node="selectedNodeDetail" />

              <RuntimeActionPanel
                :node="selectedNodeDetail"
                :selected-workflow-node-id="selectedWorkflowNodeId"
                :detail="runtimeDetail"
                :trigger-result="runtimeTriggerResult"
                :detail-loading="runtimeDetailLoading"
                :trigger-loading="runtimeTriggerLoading"
                :error="runtimeError?.message ?? null"
                :prompt-copy-status="promptCopyStatus"
                :prompt-copy-error="promptCopyError?.message ?? null"
                @update:selected-workflow-node-id="selectedWorkflowNodeId = $event"
                @refresh="handleRuntimeRefresh"
                @trigger="handleRuntimeTrigger"
                @retry-copy="handleRetryCopyPrompt"
              />
            </div>
          </div>

          <EmptyState
            v-if="!selectedProjectId && items.length === 0"
            title="还没有项目"
            description="先创建一个项目，再继续后续的节点树与主工作区能力。"
            action-label="新建项目"
            @action="startCreateProject"
          />
        </div>
      </div>
    </div>

    <ProjectDeleteDialog
      :open="deleteDialogOpen"
      :project-name="selectedProject?.name ?? ''"
      :checking="deleteChecking"
      :executing="deleteExecuting"
      :error="deleteError?.message ?? null"
      :check-result="deleteCheckResult"
      :draft="deleteDraft"
      @update:draft="deleteDraft = $event"
      @close="closeDialog"
      @confirm="handleDeleteConfirm"
    />

    <NodeEditor
      :open="nodeEditorOpen"
      :mode="nodeEditorMode"
      :draft="nodeDraft"
      :parent-options="parentOptions"
      :workflow-options="workflowOptions"
      :workflow-loading="workflowLoading"
      :saving="nodeSaving"
      @update:draft="nodeDraft = $event"
      @close="closeNodeEditor"
      @save="handleSaveNode"
    />

    <NodeDeleteDialog
      :open="nodeDeleteDialogOpen"
      :node-name="selectedNodeDetail?.name ?? ''"
      :checking="nodeDeleteChecking"
      :executing="nodeDeleteExecuting"
      :error="nodeDeleteError?.message ?? null"
      :check-result="nodeDeleteCheckResult"
      :draft="nodeDeleteDraft"
      @update:draft="nodeDeleteDraft = $event"
      @close="closeNodeDeleteDialog"
      @confirm="handleDeleteNodeConfirm"
    />
  </PageShell>
</template>

<style scoped>
.projects-workspace {
  display: grid;
  gap: 20px;
}

.projects-workspace__hero {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 20px;
  padding: 22px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(18, 113, 93, 0.12), transparent 28%),
    linear-gradient(135deg, rgba(255, 249, 241, 0.96), rgba(245, 236, 223, 0.95));
  border: 1px solid rgba(120, 92, 56, 0.16);
}

.projects-workspace__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.projects-workspace__hero h2 {
  margin: 8px 0 10px;
  font-size: 34px;
}

.projects-workspace__hero p {
  max-width: 760px;
  margin: 0;
  color: #6f6255;
  line-height: 1.7;
}

.projects-workspace__hero-side {
  display: grid;
  gap: 12px;
}

.projects-workspace__status,
.projects-workspace__runtime {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 252, 247, 0.72);
  border: 1px solid rgba(120, 92, 56, 0.12);
}

.projects-workspace__status span,
.projects-workspace__runtime span {
  color: #6f6255;
  font-size: 12px;
}

.projects-workspace__status strong {
  font-size: 18px;
}

.projects-workspace__grid {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.projects-workspace__main {
  display: grid;
  gap: 20px;
}

.projects-workspace__workspace-grid {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(0, 1fr) minmax(320px, 420px);
  gap: 14px;
}

.projects-workspace__detail-stack {
  display: grid;
  gap: 14px;
}

.projects-workspace__deletion-copy {
  display: grid;
  gap: 8px;
}

.projects-workspace__deletion-copy p {
  margin: 0;
  color: #6f6255;
  line-height: 1.65;
}

.projects-workspace__canvas-note {
  margin: 16px 0 0;
  color: #8b7b6d;
  line-height: 1.65;
}

@media (max-width: 1120px) {
  .projects-workspace__grid,
  .projects-workspace__workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .projects-workspace__hero {
    display: grid;
  }
}
</style>
