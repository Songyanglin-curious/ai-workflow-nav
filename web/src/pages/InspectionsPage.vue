<template>
  <section class="system-card">
    <header>
      <p class="eyebrow">System</p>
      <h2>巡检页面装配壳</h2>
      <p>用于挂载巡检执行按钮、结果摘要和问题表格，页面层不重复判断后端错误语义。</p>
    </header>

    <div class="system-card__grid">
      <article>
        <strong>执行入口</strong>
        <p>后续由 `modules/system/inspections` 提供执行与刷新逻辑。</p>
      </article>
      <article>
        <strong>结果展示</strong>
        <p>承接严重级别、对象标识和修复建议的页面级排布。</p>
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

.system-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.system-card__grid article {
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(120, 92, 56, 0.16);
  background: rgba(255, 250, 242, 0.92);
}

.system-card__grid p {
  margin: 10px 0 0;
  color: #6f6255;
  line-height: 1.65;
}

@media (max-width: 720px) {
  .system-card__grid {
    grid-template-columns: 1fr;
  }
}
</style>
