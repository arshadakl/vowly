<script setup lang="ts">
defineProps<{
  studio: {
    name: string
    instagram: string | null
    phone: string | null
  }
}>()
</script>

<template>
  <footer class="bg-[#faf5ef] px-6 py-10 text-center">
    <div class="mb-4 flex items-center justify-center gap-3">
      <span class="h-px w-16 bg-gold-500/30" />
      <span class="text-gold-500">&#10045;</span>
      <span class="h-px w-16 bg-gold-500/30" />
    </div>
    <p class="font-display text-sm tracking-widest text-ink-700/50">Captured with love</p>
    <p class="mt-1 font-display text-lg font-medium text-ink-800">{{ studio.name }}</p>
    <div
      v-if="studio.instagram || studio.phone"
      class="mt-3 flex items-center justify-center gap-4 text-sm text-ink-700"
    >
      <a
        v-if="studio.instagram"
        :href="`https://instagram.com/${studio.instagram}`"
        target="_blank"
        rel="noopener noreferrer"
        class="transition-colors hover:text-gold-500"
        >Instagram</a
      >
      <a
        v-if="studio.phone"
        :href="`tel:${studio.phone}`"
        class="transition-colors hover:text-gold-500"
        >{{ studio.phone }}</a
      >
    </div>
  </footer>
</template>
