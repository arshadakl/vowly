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
  <footer class="relative overflow-hidden px-6 pb-20 pt-16 text-center">
    <!-- Background leaves left and right -->
    <svg class="pointer-events-none absolute bottom-0 left-0 w-48 opacity-[0.15] @[640px]:w-64" viewBox="0 0 200 200" aria-hidden="true">
      <image href="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/leaf.svg" x="-30" y="30" width="160" height="160" transform="rotate(45 50 50)" />
    </svg>
    <svg class="pointer-events-none absolute bottom-0 right-0 w-48 opacity-[0.15] @[640px]:w-64" viewBox="0 0 200 200" aria-hidden="true">
      <image href="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/leaf.svg" x="70" y="30" width="160" height="160" transform="rotate(-45 150 50)" />
    </svg>

    <div class="relative z-10 mx-auto max-w-2xl">
      <!-- Top Ornament -->
      <div class="mb-5 flex justify-center">
        <svg class="h-6 w-10 text-gold-600" viewBox="0 0 48 32" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M24 30C24 30 20 18 10 16C20 14 24 2 24 2C24 2 28 14 38 16C28 18 24 30 24 30Z" fill="currentColor" fill-opacity="0.2"/>
          <path d="M24 30C24 30 16 26 12 32" stroke-linecap="round"/>
          <path d="M24 30C24 30 32 26 36 32" stroke-linecap="round"/>
        </svg>
      </div>
      
      <!-- Main Branding Row -->
      <div class="flex items-center justify-center gap-4 @[640px]:gap-6">
        <!-- Left Sprig -->
        <svg class="h-8 w-8 text-gold-600 @[640px]:h-10 @[640px]:w-10" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M35 35 C 20 35, 5 25, 5 10" stroke-linecap="round" />
          <path d="M5 10 C 5 15, 10 20, 15 20 C 12 17, 10 12, 5 10" fill="currentColor" fill-opacity="0.3" />
          <path d="M12 18 C 12 23, 17 28, 22 28 C 19 25, 17 20, 12 18" fill="currentColor" fill-opacity="0.3" />
          <path d="M20 27 C 20 32, 25 35, 30 35 C 27 32, 25 28, 20 27" fill="currentColor" fill-opacity="0.3" />
        </svg>

        <!-- Force 'Lace & Looms' text visually, but can be driven by studio.name if needed -->
        <p class="font-display text-4xl font-normal tracking-wide text-ink-800 @[640px]:text-5xl">
          Lace &amp; Looms
        </p>

        <!-- Right Sprig -->
        <svg class="h-8 w-8 text-gold-600 @[640px]:h-10 @[640px]:w-10" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M5 35 C 20 35, 35 25, 35 10" stroke-linecap="round" />
          <path d="M35 10 C 35 15, 30 20, 25 20 C 28 17, 30 12, 35 10" fill="currentColor" fill-opacity="0.3" />
          <path d="M28 18 C 28 23, 23 28, 18 28 C 21 25, 23 20, 28 18" fill="currentColor" fill-opacity="0.3" />
          <path d="M20 27 C 20 32, 15 35, 10 35 C 13 32, 15 28, 20 27" fill="currentColor" fill-opacity="0.3" />
        </svg>
      </div>

      <!-- Underline with Heart -->
      <div class="mx-auto mt-4 flex w-full max-w-[360px] items-center justify-center gap-4">
        <div class="h-px w-full bg-gold-500/40"></div>
        <div class="text-[10px] text-gold-500">♥</div>
        <div class="h-px w-full bg-gold-500/40"></div>
      </div>

      <!-- Slogan -->
      <p class="mt-8 font-display text-[9.5px] font-semibold tracking-[0.25em] text-ink-800/80 uppercase">
        Woven with love, celebrated forever
      </p>

      <div
        v-if="studio.instagram || studio.phone"
        class="mt-8 flex items-center justify-center gap-6 text-xs text-ink-700 uppercase tracking-widest"
      >
        <a
          v-if="studio.instagram"
          :href="`https://instagram.com/${studio.instagram}`"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-gold-600"
          >Instagram</a
        >
        <a
          v-if="studio.phone"
          :href="`tel:${studio.phone}`"
          class="transition-colors hover:text-gold-600"
          >{{ studio.phone }}</a
        >
      </div>
    </div>
  </footer>
</template>
