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
  <footer class="py-8 text-center">
    <p class="font-display text-sm tracking-widest text-ink-700/70">
      Captured with ❤️
    </p>
    <p class="mt-1 font-display text-lg font-medium text-ink-800">
      {{ studio.name }}
    </p>
    <div
      v-if="studio.instagram || studio.phone"
      class="mt-3 flex items-center justify-center gap-4 text-sm text-ink-700"
    >
      <a
        v-if="studio.instagram"
        :href="`https://instagram.com/${studio.instagram}`"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:text-gold-500 transition-colors"
      >
        Instagram
      </a>
      <a
        v-if="studio.phone"
        :href="`tel:${studio.phone}`"
        class="hover:text-gold-500 transition-colors"
      >
        {{ studio.phone }}
      </a>
    </div>
  </footer>
</template>
