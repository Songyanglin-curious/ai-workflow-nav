<script setup lang="ts">
import {
  deletionStrategyLabels,
  describeDeletionStrategy,
  type ProjectNodeDeletionCheckResult,
  type ProjectNodeDeletionDraft,
} from '../types.js';

const props = withDefaults(
  defineProps<{
    open: boolean;
    nodeName: string;
    checking?: boolean;
    executing?: boolean;
    error?: string | null;
    checkResult: ProjectNodeDeletionCheckResult | null;
    draft: ProjectNodeDeletionDraft;
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
  'update:draft': [draft: ProjectNodeDeletionDraft];
}>();

function patchDraft<K extends keyof ProjectNodeDeletionDraft>(
  key: K,
  value: ProjectNodeDeletionDraft[K],
): void {
  emit('update:draft', {
    ...props.draft,
    [key]: value,
  });
}
</script>

<template>
  <n-modal :show="open" preset="card" :mask-closable="false" style="width: min(760px, calc(100vw - 32px))">
    <section class="node-delete-dialog">
      <header class="node-delete-dialog__header">
        <div>
          <p class="node-delete-dialog__eyebrow">Project Node Deletion</p>
          <h3>删除节点保护流程</h3>
        </div>

        <n-button quaternary circle @click="$emit('close')">
          ×
        </n-button>
      </header>

      <n-alert type="warning" :bordered="false">
        将删除 <strong>{{ nodeName || '当前节点' }}</strong> 的元数据、节点工作流绑定和节点目录；若存在直接子节点，它们会被提升到根层，而不是一起删除。
      </n-alert>

      <n-spin :show="checking">
        <div v-if="checkResult" class="node-delete-dialog__body">
          <div class="node-delete-dialog__stats">
            <article>
              <span>直接子节点数</span>
              <strong>{{ checkResult.directChildCount }}</strong>
            </article>
            <article>
              <span>summary 文件数</span>
              <strong>{{ checkResult.summaryFileCount }}</strong>
            </article>
            <article>
              <span>是否需要二次确认</span>
              <strong>{{ checkResult.requiresSecondConfirmation ? '需要' : '不需要' }}</strong>
            </article>
          </div>

          <n-alert v-if="checkResult.directChildCount > 0" type="info" :bordered="false">
            删除后会把 {{ checkResult.directChildCount }} 个直接子节点提升为根层孤岛节点，并保持它们之间的相对顺序。
          </n-alert>

          <n-form label-placement="top">
            <n-form-item label="删除策略">
              <n-radio-group :value="draft.strategy" @update:value="patchDraft('strategy', $event)">
                <n-space vertical>
                  <n-radio
                    v-for="strategy in checkResult.allowedStrategies"
                    :key="strategy"
                    :value="strategy"
                  >
                    <div class="node-delete-dialog__strategy">
                      <strong>{{ deletionStrategyLabels[strategy] }}</strong>
                      <p>{{ describeDeletionStrategy(strategy) }}</p>
                    </div>
                  </n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>

            <n-form-item>
              <n-checkbox :checked="draft.confirmDelete" @update:checked="patchDraft('confirmDelete', $event)">
                我确认要删除这个节点
              </n-checkbox>
            </n-form-item>

            <n-form-item v-if="checkResult.requiresSecondConfirmation">
              <n-checkbox
                :checked="draft.secondConfirmation"
                @update:checked="patchDraft('secondConfirmation', $event)"
              >
                我已确认该节点存在 summaries 内容，并接受 summaryArchives 转存或直接删除的后果
              </n-checkbox>
            </n-form-item>
          </n-form>
        </div>
      </n-spin>

      <p v-if="error" class="node-delete-dialog__error">{{ error }}</p>

      <footer class="node-delete-dialog__footer">
        <n-button @click="$emit('close')">取消</n-button>
        <n-button type="error" :loading="executing" @click="$emit('confirm')">执行删除</n-button>
      </footer>
    </section>
  </n-modal>
</template>

<style scoped>
.node-delete-dialog {
  display: grid;
  gap: 18px;
}

.node-delete-dialog__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.node-delete-dialog__eyebrow {
  margin: 0;
  color: #b54708;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.node-delete-dialog__header h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.node-delete-dialog__body {
  display: grid;
  gap: 18px;
}

.node-delete-dialog__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.node-delete-dialog__stats article {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 247, 237, 0.9);
}

.node-delete-dialog__stats span {
  color: #9a3412;
  font-size: 12px;
}

.node-delete-dialog__stats strong {
  font-size: 18px;
}

.node-delete-dialog__strategy p {
  margin: 4px 0 0;
  color: #6f6255;
  line-height: 1.55;
}

.node-delete-dialog__error {
  margin: 0;
  color: #b42318;
}

.node-delete-dialog__footer {
  display: flex;
  justify-content: end;
  gap: 12px;
}

@media (max-width: 720px) {
  .node-delete-dialog__stats {
    grid-template-columns: 1fr;
  }
}
</style>
