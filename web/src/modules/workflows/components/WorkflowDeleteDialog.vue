<script setup lang="ts">
defineProps<{
  open: boolean;
  workflowName: string;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <n-modal :show="open" preset="card" :mask-closable="false" style="width: 520px">
    <div class="workflow-delete-dialog">
      <h3>删除工作流</h3>
      <p>
        确认删除 <strong>{{ workflowName }}</strong> 吗？删除后会一并移除该工作流的节点动作绑定。
      </p>

      <div class="workflow-delete-dialog__actions">
        <n-button @click="$emit('cancel')">取消</n-button>
        <n-button type="error" @click="$emit('confirm')">确认删除</n-button>
      </div>
    </div>
  </n-modal>
</template>

<style scoped>
.workflow-delete-dialog {
  display: grid;
  gap: 12px;
}

.workflow-delete-dialog h3 {
  margin: 0;
  font-size: 18px;
}

.workflow-delete-dialog p {
  margin: 0;
  color: #6f6255;
  line-height: 1.65;
}

.workflow-delete-dialog__actions {
  display: flex;
  justify-content: end;
  gap: 12px;
}
</style>
