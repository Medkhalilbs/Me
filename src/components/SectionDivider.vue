<template>
  <div class="section-divider-wrap">
    <div class="divider-line"></div>
    <div class="divider-dot"></div>
    <div class="divider-line"></div>
  </div>
</template>

<script setup lang="ts">
// Static presentation — no reactive logic needed
</script>

<style scoped>
.section-divider-wrap {
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
  z-index: 1;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border);
  opacity: 0.3;
}

.divider-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent-navy);
  flex-shrink: 0;
  margin: 0 1rem;
  opacity: 0.6;
}
</style>
