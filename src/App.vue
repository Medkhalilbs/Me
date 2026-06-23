<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'

const portfolioStore = usePortfolioStore()

onMounted(() => {
  portfolioStore.fetchAll()
})
</script>

<style>
/* Global resets or overrides if needed */
</style>
