<script setup lang="ts">
defineProps<{
  loading?: boolean;
}>();

defineEmits<{
  trigger: [];
}>();
</script>

<template>
  <n-button type="warning" :loading="loading" @click="$emit('trigger')">
    执行 rebuild 导入
  </n-button>
</template>
