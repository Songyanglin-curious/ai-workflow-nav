<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    disabled: false,
    loading: false,
  },
);

defineEmits<{
  append: [];
}>();
</script>

<template>
  <n-button type="primary" :disabled="disabled" :loading="loading" @click="$emit('append')">
    追加剪贴板到最新文件
  </n-button>
</template>
