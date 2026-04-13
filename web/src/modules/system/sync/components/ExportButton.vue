<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();

defineEmits<{
  trigger: [];
}>();
</script>

<template>
  <n-button type="primary" :loading="loading" @click="$emit('trigger')">
    执行导出
  </n-button>
</template>
