<script setup lang="ts">
useSeoMeta({
  title: 'Welcome',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-6 text-center bg-ivory-50">
    <h1 class="font-display text-6xl font-medium text-ink-900 md:text-8xl">Vowly</h1>
    <p class="mt-4 text-lg tracking-wide text-ink-700">Wedding invitations, beautifully managed.</p>
    <NuxtLink
      to="/login"
      class="mt-8 rounded-full bg-ink-900 px-8 py-3 text-sm font-medium uppercase tracking-widest text-ivory-50 hover:bg-gold-600 transition-colors"
    >
      Enter
    </NuxtLink>
  </div>
</template>
