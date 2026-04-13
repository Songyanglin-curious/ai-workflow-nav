<template>
  <section class="system-card">
    <header>
      <p class="eyebrow">System</p>
      <h2>导入导出页面装配壳</h2>
      <p>后续会在这里装配导出、重建导入和结果面板，保留明确的页面级流程顺序。</p>
    </header>

    <div class="stack">
      <article>
        <strong>导出</strong>
        <p>承接结构化数据导出入口与结果摘要。</p>
      </article>
      <article>
        <strong>导入</strong>
        <p>承接 rebuild 模式导入动作，并展示严格失败语义。</p>
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

.stack {
  display: grid;
  gap: 14px;
}

.stack article {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(120, 92, 56, 0.16);
  background: rgba(255, 250, 242, 0.92);
}

.stack p {
  margin: 10px 0 0;
  color: #6f6255;
  line-height: 1.65;
}
</style>
