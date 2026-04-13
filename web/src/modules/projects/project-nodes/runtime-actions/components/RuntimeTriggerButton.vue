<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  loading?: boolean;
}>();

defineEmits<{
  trigger: [];
}>();
</script>

<template>
  <n-button type="primary" :disabled="disabled" :loading="loading" @click="$emit('trigger')">
    触发当前动作
  </n-button>
</template>
