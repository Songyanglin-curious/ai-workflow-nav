<script setup lang="ts">
import type { WorkflowNodeActionSyncResult } from '../types.js';

withDefaults(
  defineProps<{
    pending?: boolean;
    disabled?: boolean;
    result?: WorkflowNodeActionSyncResult | null;
  }>(),
  {
    pending: false,
    disabled: false,
    result: null,
  },
);

defineEmits<{
  sync: [];
}>();
</script>

<template>
  <div class="node-action-sync-button">
    <n-button size="small" :loading="pending" :disabled="disabled" @click="$emit('sync')">同步无效绑定</n-button>
    <p v-if="result" class="node-action-sync-button__result">
      已清理 {{ result.removedCount }} 条失效绑定，剩余 {{ result.remainingCount }} 条。
    </p>
  </div>
</template>

<style scoped>
.node-action-sync-button {
  display: grid;
  gap: 6px;
}

.node-action-sync-button__result {
  margin: 0;
  color: #6f6255;
  font-size: 12px;
}
</style>
