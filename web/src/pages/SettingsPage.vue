<template>
  <section class="system-card">
    <header>
      <p class="eyebrow">System</p>
      <h2>设置摘要页面装配壳</h2>
      <p>按照当前约束，这里先只做展示型页面，不预设完整编辑流程，也不发明独立 settings API。</p>
    </header>

    <div class="summary-grid">
      <article>
        <strong>工具配置摘要</strong>
        <p>后续复用已有系统接口返回的配置结果做展示。</p>
      </article>
      <article>
        <strong>运行环境摘要</strong>
        <p>保持只读，不在这里偷偷扩成新的服务端真值入口。</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.system-card {
  display: grid;
  gap: 18px;
}

.eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h2 {
  margin: 8px 0 10px;
  font-size: 34px;
}

header p:last-child {
  max-width: 760px;
  margin: 0;
  color: #6f6255;
  line-height: 1.7;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.summary-grid article {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(120, 92, 56, 0.16);
  background: rgba(255, 250, 242, 0.92);
}

.summary-grid p {
  margin: 10px 0 0;
  color: #6f6255;
  line-height: 1.65;
}

@media (max-width: 720px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
