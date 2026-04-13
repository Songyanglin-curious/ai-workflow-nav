<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    titleDraft: string;
    loading?: boolean;
    error?: string | null;
  }>(),
  {
    loading: false,
    error: null,
  },
);

const emit = defineEmits<{
  close: [];
  confirm: [];
  'update:titleDraft': [title: string];
}>();

function updateTitleDraft(value: string): void {
  emit('update:titleDraft', value);
}
</script>

<template>
  <n-modal :show="open" preset="card" :mask-closable="false" style="width: min(560px, calc(100vw - 32px))">
    <section class="create-deliberation-file-dialog">
      <header class="create-deliberation-file-dialog__header">
        <div>
          <p class="create-deliberation-file-dialog__eyebrow">Deliberations</p>
          <h3>新建推敲记录文件</h3>
        </div>

        <n-button quaternary circle @click="$emit('close')">
          ×
        </n-button>
      </header>

      <n-alert type="info" :bordered="false">
        只提交标题，由服务端按 `yyyyMMdd-HHmmss__名称.md` 规则生成最终文件名。
      </n-alert>

      <n-form label-placement="top">
        <n-form-item label="文件标题">
          <n-input
            :value="props.titleDraft"
            placeholder="留空时将使用默认标题"
            @update:value="updateTitleDraft"
          />
        </n-form-item>
      </n-form>

      <p v-if="error" class="create-deliberation-file-dialog__error">{{ error }}</p>

      <footer class="create-deliberation-file-dialog__footer">
        <n-button @click="$emit('close')">取消</n-button>
        <n-button type="primary" :loading="loading" @click="$emit('confirm')">创建文件</n-button>
      </footer>
    </section>
  </n-modal>
</template>

<style scoped>
.create-deliberation-file-dialog {
  display: grid;
  gap: 18px;
}

.create-deliberation-file-dialog__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.create-deliberation-file-dialog__eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.create-deliberation-file-dialog__header h3 {
  margin: 6px 0 0;
  font-size: 22px;
}

.create-deliberation-file-dialog__error {
  margin: 0;
  color: #b42318;
}

.create-deliberation-file-dialog__footer {
  display: flex;
  justify-content: end;
  gap: 12px;
}
</style>
