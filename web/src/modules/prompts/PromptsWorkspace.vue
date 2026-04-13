<script setup lang="ts">
import { onMounted } from 'vue';

import PromptDeleteDialog from './PromptDeleteDialog.vue';
import PromptDetailPanel from './PromptDetailPanel.vue';
import PromptEditor from './PromptEditor.vue';
import PromptList from './PromptList.vue';
import { usePromptsModule } from './usePromptsModule';

const {
  items,
  keyword,
  category,
  promptCount,
  selectedPromptId,
  selectedPrompt,
  listLoading,
  detailLoading,
  editorPending,
  deletePending,
  listError,
  detailError,
  editorError,
  deleteError,
  editorOpen,
  editorMode,
  editorDraft,
  deleteOpen,
  deleteTarget,
  initialize,
  refreshList,
  searchPrompts,
  selectPrompt,
  openCreate,
  openEdit,
  closeEditor,
  savePrompt,
  requestDelete,
  cancelDelete,
  confirmDelete,
  clearSelection,
} = usePromptsModule();

onMounted(() => {
  void initialize();
});
</script>

<template>
  <section class="prompts-workspace">
    <header class="prompts-workspace__hero">
      <div>
        <p class="prompts-workspace__eyebrow">Prompts</p>
        <h2>Prompt 管理工作区</h2>
        <p>这里承接 Prompt 的列表、详情、编辑与删除交互，页面层只需要负责装配。</p>
      </div>

      <div class="prompts-workspace__stat">
        <span>当前数量</span>
        <strong>{{ promptCount }}</strong>
      </div>
    </header>

    <div class="prompts-workspace__grid">
      <PromptList
        v-model:keyword="keyword"
        v-model:category="category"
        :items="items"
        :selected-prompt-id="selectedPromptId"
        :loading="listLoading"
        :error="listError"
        @search="searchPrompts"
        @select="selectPrompt"
        @create="openCreate"
        @refresh="refreshList"
      />

      <PromptDetailPanel
        :prompt="selectedPrompt"
        :loading="detailLoading"
        :error="detailError"
        @edit="openEdit()"
        @delete="requestDelete()"
        @close="clearSelection"
      />
    </div>

    <PromptEditor
      :open="editorOpen"
      :mode="editorMode"
      :initial-value="editorDraft"
      :pending="editorPending"
      :error="editorError"
      @close="closeEditor"
      @save="savePrompt"
    />

    <PromptDeleteDialog
      :open="deleteOpen"
      :prompt="deleteTarget"
      :pending="deletePending"
      :error="deleteError"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </section>
</template>

<style scoped>
.prompts-workspace {
  display: grid;
  gap: 20px;
}

.prompts-workspace__hero {
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

.prompts-workspace__eyebrow {
  margin: 0 0 6px;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prompts-workspace__hero h2 {
  margin: 0;
  font-size: 1.7rem;
}

.prompts-workspace__hero p {
  margin: 8px 0 0;
  color: #475569;
  line-height: 1.7;
}

.prompts-workspace__stat {
  min-width: 130px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
  text-align: right;
}

.prompts-workspace__stat span {
  display: block;
  color: #64748b;
  font-size: 0.84rem;
}

.prompts-workspace__stat strong {
  font-size: 1.8rem;
  color: #0f172a;
}

.prompts-workspace__grid {
  display: grid;
  grid-template-columns: minmax(320px, 380px) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

@media (max-width: 960px) {
  .prompts-workspace__grid,
  .prompts-workspace__hero {
    grid-template-columns: 1fr;
  }

  .prompts-workspace__hero {
    display: grid;
  }

  .prompts-workspace__stat {
    text-align: left;
  }
}
</style>
