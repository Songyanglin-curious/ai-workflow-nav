<script setup lang="ts">
defineProps<{
  loading?: boolean;
  hasResult?: boolean;
}>();

defineEmits<{
  run: [];
}>();
</script>

<template>
  <n-button type="primary" :loading="loading" @click="$emit('run')">
    {{ hasResult ? '重新执行巡检' : '执行巡检' }}
  </n-button>
</template>
