<script setup lang="ts">
import {
  deletionStrategyLabels,
  describeDeletionStrategy,
  type ProjectDeletionCheckResult,
  type ProjectDeletionDraft,
} from '../types.js';

const props = withDefaults(
  defineProps<{
    open: boolean;
    projectName: string;
    checking?: boolean;
    executing?: boolean;
    error?: string | null;
    checkResult: ProjectDeletionCheckResult | null;
    draft: ProjectDeletionDraft;
  }>(),
  {
    checking: false,
    executing: false,
    error: null,
  },
);

const emit = defineEmits<{
  close: [];
  confirm: [];
  'update:draft': [draft: ProjectDeletionDraft];
}>();

function patchDraft<K extends keyof ProjectDeletionDraft>(key: K, value: ProjectDeletionDraft[K]): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <n-modal :show="open" preset="card" :mask-closable="false" style="width: min(760px, calc(100vw - 32px))">
    <section class="project-delete-dialog">
      <header class="project-delete-dialog__header">
        <div>
          <p class="project-delete-dialog__eyebrow">Project Deletion</p>
          <h3>删除项目保护流程</h3>
        </div>

        <n-button quaternary circle @click="$emit('close')">
          ×
        </n-button>
      </header>

      <n-alert type="warning" :bordered="false">
        将删除 <strong>{{ projectName || '当前项目' }}</strong> 的元数据、节点、节点工作流绑定、视图配置和项目目录。
      </n-alert>

      <n-spin :show="checking">
        <div v-if="checkResult" class="project-delete-dialog__body">
          <div class="project-delete-dialog__stats">
            <article>
              <span>项目节点数</span>
              <strong>{{ checkResult.projectNodeCount }}</strong>
            </article>
            <article>
              <span>含 summaries 节点数</span>
              <strong>{{ checkResult.summaryNodeCount }}</strong>
            </article>
            <article>
              <span>是否需要二次确认</span>
              <strong>{{ checkResult.requiresSecondConfirmation ? '需要' : '不需要' }}</strong>
            </article>
          </div>

          <n-form label-placement="top">
            <n-form-item label="删除策略">
              <n-radio-group :value="draft.strategy" @update:value="patchDraft('strategy', $event)">
                <n-space vertical>
                  <n-radio
                    v-for="strategy in checkResult.allowedStrategies"
                    :key="strategy"
                    :value="strategy"
                  >
                    <div class="project-delete-dialog__strategy">
                      <strong>{{ deletionStrategyLabels[strategy] }}</strong>
                      <p>{{ describeDeletionStrategy(strategy) }}</p>
                    </div>
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item>
              <n-checkbox :checked="draft.confirmDelete" @update:checked="patchDraft('confirmDelete', $event)">
                我确认要删除这个项目
              </n-checkbox>
            </n-form-item>

            <n-form-item v-if="checkResult.requiresSecondConfirmation">
              <n-checkbox
                :checked="draft.secondConfirmation"
                @update:checked="patchDraft('secondConfirmation', $event)"
              >
                我已确认该项目存在 summaries 内容，并接受删除保护策略的后果
              </n-checkbox>
            </n-form-item>
          </n-form>
        </div>
      </n-spin>

      <p v-if="error" class="project-delete-dialog__error">{{ error }}</p>

      <footer class="project-delete-dialog__footer">
        <n-button @click="$emit('close')">取消</n-button>
        <n-button type="error" :loading="executing" @click="$emit('confirm')">执行删除</n-button>
      </footer>
    </section>
  </n-modal>
</template>

<style scoped>
.project-delete-dialog {
  display: grid;
  gap: 18px;
}

.project-delete-dialog__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.project-delete-dialog__eyebrow {
  margin: 0;
  color: #b54708;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.project-delete-dialog__header h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.project-delete-dialog__body {
  display: grid;
  gap: 18px;
}

.project-delete-dialog__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.project-delete-dialog__stats article {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 247, 237, 0.9);
}

.project-delete-dialog__stats span {
  color: #9a3412;
  font-size: 12px;
}

.project-delete-dialog__stats strong {
  font-size: 18px;
}

.project-delete-dialog__strategy p {
  margin: 4px 0 0;
  color: #6f6255;
  line-height: 1.55;
}

.project-delete-dialog__error {
  margin: 0;
  color: #b42318;
}

.project-delete-dialog__footer {
  display: flex;
  justify-content: end;
  gap: 12px;
}

@media (max-width: 720px) {
  .project-delete-dialog__stats {
    grid-template-columns: 1fr;
  }
}
</style>
