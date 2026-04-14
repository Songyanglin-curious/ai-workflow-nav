<script setup lang="ts">
import { computed } from 'vue'
import {
  AddOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  CheckmarkOutline,
  CopyOutline,
  SaveOutline,
  SearchOutline,
  TrashOutline,
} from '@vicons/ionicons5'
import {
  NButton,
  NCard,
  NConfigProvider,
  NEmpty,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NIcon,
  NInput,
  NPopconfirm,
  NSelect,
  NSpace,
  NText,
  NTooltip,
} from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import { naiveThemeOverrides } from '../../app/theme/tokens'
import { usePromptPage } from './composables/usePromptPage'

const {
  keyword,
  draft,
  loading,
  saving,
  isCreating,
  filteredPrompts,
  selectedId,
  selectedPrompt,
  selectedUpdatedAt,
  selectedFilePath,
  selectedPromptContent,
  sidebarExpanded,
  showDetail,
  categoryOptions,
  canCopy,
  canDelete,
  canSaveNewPrompt,
  copyDone,
  statusText,
  handleCopy,
  handleCreate,
  handleSelect,
  handlePatchDraft,
  handleSave,
  handleDelete,
  handlePromptPathClick,
  toggleSidebarExpanded,
} = usePromptPage()

const detailTitle = computed(() => {
  if (isCreating.value) {
    return draft.value?.title?.trim() || '新建提示词'
  }

  return selectedPrompt.value?.title ?? '提示词详情'
})

const categorySelectOptions = computed(
  () => categoryOptions as unknown as SelectOption[],
)
</script>

<template>
  <n-config-provider :theme-overrides="naiveThemeOverrides">
    <div :class="['prompt-page', { 'prompt-page--expanded': sidebarExpanded }]">
      <n-card
        size="small"
        :bordered="false"
        :class="['prompt-page__panel', 'prompt-page__sidebar', { 'prompt-page__sidebar--expanded': sidebarExpanded }]"
      >
        <template #header>
          <div class="prompt-page__sidebar-header">
            <span>提示词</span>
            <n-space :size="6" align="center">
              <n-text depth="3">{{ filteredPrompts.length }} 条</n-text>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button quaternary circle class="prompt-page__toggle-button" @click="toggleSidebarExpanded">
                    <template #icon>
                      <n-icon size="18">
                        <chevron-back-outline v-if="sidebarExpanded" />
                        <chevron-forward-outline v-else />
                      </n-icon>
                    </template>
                  </n-button>
                </template>
                {{ sidebarExpanded ? '收起目录' : '展开目录' }}
              </n-tooltip>
            </n-space>
          </div>
        </template>

        <div class="prompt-page__sidebar-top">
          <n-space :size="8" align="center">
            <div style="flex: 1;">
              <n-input
                :value="keyword"
                size="small"
                clearable
                placeholder="搜索名称 / 描述"
                @update:value="keyword = $event"
              >
                <template #prefix>
                  <n-icon><search-outline /></n-icon>
                </template>
              </n-input>
            </div>

            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button circle size="small" type="primary" secondary @click="handleCreate">
                  <template #icon>
                    <n-icon><add-outline /></n-icon>
                  </template>
                </n-button>
              </template>
              新建提示词
            </n-tooltip>
          </n-space>
        </div>

        <div class="prompt-page__sidebar-scroll">
          <div v-if="loading" class="prompt-page__empty-wrap">
            <n-empty description="正在加载" size="small" />
          </div>

          <div v-else-if="filteredPrompts.length === 0" class="prompt-page__empty-wrap">
            <n-empty description="没有匹配结果" size="small" />
          </div>

          <div :class="['prompt-list', { 'prompt-list--cards': sidebarExpanded }]">
            <button
              v-for="item in filteredPrompts"
              :key="item.id"
              type="button"
              :class="[
                'prompt-list__item',
                { 'prompt-list__item--active': item.id === selectedId },
                { 'prompt-list__item--expanded': sidebarExpanded },
              ]"
              @click="handleSelect(item.id)"
            >
              <div class="prompt-list__item-head">
                <div class="prompt-list__title">{{ item.title }}</div>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button
                      circle
                      size="tiny"
                      quaternary
                      class="prompt-page__copy-trigger"
                      :disabled="!item.content"
                      @click.stop="handleCopy(item.content)"
                    >
                      <template #icon>
                        <n-icon><copy-outline /></n-icon>
                      </template>
                    </n-button>
                  </template>
                  复制提示词内容
                </n-tooltip>
              </div>
              <div v-if="sidebarExpanded" class="prompt-list__description">
                {{ item.description }}
              </div>
              <div v-if="sidebarExpanded" class="prompt-list__meta">
                <span>{{ item.category }}</span>
                <span>{{ item.updatedAt }}</span>
              </div>
            </button>
          </div>
        </div>
      </n-card>

      <n-card
        v-if="showDetail"
        size="small"
        :bordered="false"
        :class="['prompt-page__panel', 'prompt-page__detail']"
      >
        <template #header>
          <div class="prompt-page__detail-header">
            <div class="prompt-page__detail-title">
              <span>{{ detailTitle }}</span>
              <n-text depth="3">
                {{ statusText }}
                <template v-if="selectedUpdatedAt && !isCreating"> · {{ selectedUpdatedAt }}</template>
              </n-text>
            </div>

            <n-space :size="6" align="center">
              <n-button
                v-if="isCreating"
                size="small"
                type="primary"
                :disabled="!canSaveNewPrompt"
                :loading="saving"
                @click="handleSave"
              >
                <template #icon>
                  <n-icon><save-outline /></n-icon>
                </template>
                确认新建
              </n-button>

              <n-popconfirm
                v-if="canDelete"
                positive-text="确认删除"
                negative-text="取消"
                @positive-click="handleDelete"
              >
                <template #trigger>
                  <n-button circle size="small" quaternary type="error">
                    <template #icon>
                      <n-icon><trash-outline /></n-icon>
                    </template>
                  </n-button>
                </template>
                确认删除当前提示词吗？
              </n-popconfirm>
            </n-space>
          </div>
        </template>

        <div class="prompt-page__detail-scroll">
          <div v-if="!draft" class="prompt-page__empty-wrap prompt-page__empty-wrap--detail">
            <n-empty description="请选择左侧提示词或新建" size="small" />
          </div>

          <n-form v-else label-placement="top" size="small">
            <n-grid :cols="24" :x-gap="12">
              <n-gi :span="16">
                <n-form-item label="名称">
                  <n-input
                    :value="draft.title"
                    placeholder="提示词名称"
                    @update:value="handlePatchDraft({ title: $event })"
                  />
                </n-form-item>
              </n-gi>

              <n-gi :span="8">
                <n-form-item label="分类">
                  <n-select
                    :value="draft.category"
                    :options="categorySelectOptions"
                    @update:value="handlePatchDraft({ category: $event as any })"
                  />
                </n-form-item>
              </n-gi>

              <n-gi :span="24">
                <n-form-item label="描述">
                  <n-input
                    :value="draft.description"
                    class="prompt-page__description-input"
                    type="textarea"
                    placeholder="提示词描述"
                    :input-props="{ rows: 3 }"
                    @update:value="handlePatchDraft({ description: $event })"
                  />
                </n-form-item>
              </n-gi>

              <n-gi :span="24">
                <n-form-item label="提示词文件路径">
                  <n-button
                    text
                    type="primary"
                    :disabled="!selectedFilePath"
                    @click="handlePromptPathClick"
                  >
                    {{ selectedFilePath || '暂无文件路径' }}
                  </n-button>
                </n-form-item>
              </n-gi>

              <n-gi :span="24">
                <n-form-item>
                  <template #label>
                    <div class="prompt-page__content-label">
                      <span>提示词内容</span>
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <n-button
                            circle
                            size="tiny"
                            quaternary
                            class="prompt-page__copy-trigger"
                            :disabled="!canCopy"
                            @click="handleCopy()"
                          >
                            <template #icon>
                              <n-icon>
                                <checkmark-outline v-if="copyDone" />
                                <copy-outline v-else />
                              </n-icon>
                            </template>
                          </n-button>
                        </template>
                        {{ copyDone ? '已复制提示词内容' : '复制提示词内容' }}
                      </n-tooltip>
                    </div>
                  </template>
                  <n-input
                    :value="selectedPromptContent"
                    class="prompt-page__content-input"
                    type="textarea"
                    readonly
                    :input-props="{ rows: 10 }"
                    placeholder="暂无提示词内容"
                  />
                </n-form-item>
              </n-gi>
            </n-grid>
          </n-form>
        </div>
      </n-card>
    </div>
  </n-config-provider>
</template>

<style scoped>
.prompt-page {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: var(--app-gap-md);
  height: 100svh;
  padding: var(--app-gap-md);
  overflow: hidden;
}

.prompt-page--expanded {
  grid-template-columns: 1fr;
}

.prompt-page__panel {
  background: var(--app-bg-panel);
  height: 100%;
}

.prompt-page__sidebar,
.prompt-page__detail {
  display: flex;
  flex-direction: column;
}

.prompt-page__sidebar :deep(.n-card__content),
.prompt-page__detail :deep(.n-card__content) {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.prompt-page__sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-gap-sm);
  font-size: 13px;
  font-weight: 600;
}

.prompt-page__toggle-button :deep(.n-icon) {
  font-size: 18px;
}

.prompt-page__sidebar-top {
  flex: none;
  padding-bottom: var(--app-gap-sm);
}

.prompt-page__sidebar-scroll,
.prompt-page__detail-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overflow-x: hidden;
}

.prompt-page__detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--app-gap-md);
  width: 100%;
}

.prompt-page__detail-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--app-gap-xs);
  font-size: 13px;
  font-weight: 600;
}

.prompt-page__empty-wrap {
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prompt-page__empty-wrap--detail {
  min-height: 260px;
}

.prompt-list__item {
  width: 100%;
  border: 1px solid var(--app-border);
  background: var(--app-bg-panel);
  border-radius: var(--app-radius-md);
  padding: var(--app-gap-sm) 10px;
  text-align: left;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.prompt-list {
  display: grid;
  gap: 6px;
}

.prompt-list--cards {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--app-gap-md);
  align-content: start;
}

.prompt-list__item--expanded {
  min-height: 156px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.prompt-list__item:hover {
  border-color: var(--app-border-hover);
  background: var(--app-bg-panel-muted);
}

.prompt-list__item--active {
  border-color: var(--app-primary);
  background: var(--app-primary-soft);
}

.prompt-list__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-primary);
  line-height: 1.4;
}

.prompt-list__item-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--app-gap-sm);
}

.prompt-list__description {
  margin-top: 8px;
  color: var(--app-text-secondary);
  font-size: 13px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.prompt-list__meta {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-gap-sm);
  color: var(--app-text-secondary);
  font-size: 12px;
}

.prompt-page :deep(.n-form-item-label) {
  padding-bottom: var(--app-gap-xs);
}

.prompt-page__content-label {
  display: flex;
  align-items: center;
  gap: var(--app-gap-xs);
}

.prompt-page__copy-trigger {
  cursor: pointer;
}

.prompt-page__description-input :deep(textarea) {
  resize: vertical;
  max-height: 220px;
  overflow: auto;
}

.prompt-page__content-input :deep(textarea) {
  resize: none;
  min-height: 240px;
  max-height: 100%;
  overflow: auto;
}

@media (max-width: 960px) {
  .prompt-page {
    grid-template-columns: 1fr;
    padding: var(--app-gap-sm);
  }
}
</style>
