<template>
  <section class="not-found-card">
    <p class="eyebrow">404</p>
    <h2>页面未找到</h2>
    <p>当前地址没有对应页面，你可以从左侧导航回到已建立的页面骨架。</p>
  </section>
</template>

<style scoped>
.not-found-card {
  display: grid;
  gap: 10px;
  place-items: center;
  min-height: 50vh;
  padding: 24px;
  text-align: center;
  border-radius: 28px;
  border: 1px solid rgba(120, 92, 56, 0.16);
  background: rgba(255, 250, 242, 0.9);
}

.eyebrow {
  margin: 0;
  color: #12715d;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: 34px;
}

p:last-child {
  max-width: 520px;
  margin: 0;
  color: #6f6255;
  line-height: 1.7;
}
</style>
