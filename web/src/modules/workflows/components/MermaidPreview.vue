<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import mermaid from 'mermaid';

const props = withDefaults(
  defineProps<{
    source: string;
    title?: string;
  }>(),
  {
    title: 'Mermaid 预览',
  },
);

const containerRef = ref<HTMLDivElement | null>(null);
const errorText = ref('');

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
});

let renderIndex = 0;

async function renderDiagram(): Promise<void> {
  const container = containerRef.value;

  if (!container) {
    return;
  }

  if (!props.source.trim()) {
    container.innerHTML = '<div class="mermaid-preview__empty">请输入 Mermaid 源码以查看预览</div>';
    errorText.value = '';
    return;
  }

  try {
    const renderId = `workflow-mermaid-${++renderIndex}`;
    const result = await mermaid.render(renderId, props.source);
    container.innerHTML = result.svg;
    errorText.value = '';
  } catch (cause) {
    container.innerHTML = '';
    errorText.value = cause instanceof Error ? cause.message : 'Mermaid 渲染失败';
  }
}

watch(
  () => props.source,
  () => {
    void nextTick().then(() => renderDiagram());
  },
  { immediate: true },
);

onMounted(() => {
  void renderDiagram();
});
</script>

<template>
  <section class="mermaid-preview">
    <header class="mermaid-preview__header">
      <h3>{{ title }}</h3>
      <p>仅负责结构预览，不承载编辑逻辑。</p>
    </header>

    <div ref="containerRef" class="mermaid-preview__canvas" />

    <p v-if="errorText" class="mermaid-preview__error">
      {{ errorText }}
    </p>
  </section>
</template>

<style scoped>
.mermaid-preview {
  display: grid;
  gap: 12px;
}

.mermaid-preview__header h3 {
  margin: 0;
  font-size: 16px;
}

.mermaid-preview__header p {
  margin: 6px 0 0;
  color: #6f6255;
  line-height: 1.5;
}

.mermaid-preview__canvas {
  min-height: 280px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(120, 92, 56, 0.16);
  background: rgba(255, 252, 247, 0.8);
  overflow: auto;
}

.mermaid-preview__empty {
  color: #8b7b6d;
}

.mermaid-preview__error {
  margin: 0;
  color: #b42318;
}
</style>
