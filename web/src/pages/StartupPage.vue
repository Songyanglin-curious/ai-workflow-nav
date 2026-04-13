<template>
  <section class="system-card">
    <header>
      <p class="eyebrow">System</p>
      <h2>启动报告页面装配壳</h2>
      <p>这里会装配最新启动报告和手动自检入口，让启动状态不再只停留在日志里。</p>
    </header>

    <div class="report-card">
      <strong>后续接入</strong>
      <p>
        `modules/system/startup` 将负责读取启动报告、触发自检，并把检查项状态装配到页面区块。
      </p>
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

header p:last-child,
.report-card p {
  max-width: 760px;
  margin: 0;
  color: #6f6255;
  line-height: 1.7;
}

.report-card {
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(120, 92, 56, 0.16);
  background:
    radial-gradient(circle at right top, rgba(18, 113, 93, 0.12), transparent 26%),
    rgba(255, 250, 242, 0.92);
}
</style>
