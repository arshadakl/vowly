<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { Users } from 'lucide-vue-next'
import QRCode from 'qrcode'
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{ invitation: PublicInvitation; slug?: string }>()

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return props.slug ? `https://vowly.app/${props.slug}` : window.location.href
})

const qrDataUrl = ref('')

onMounted(() => {
  QRCode.toDataURL(shareUrl.value, {
    width: 100,
    margin: 1,
    color: { dark: '#2b2620', light: '#ffffff' },
  }).then((url) => {
    qrDataUrl.value = url
  })
})
</script>

<template>
  <section class="px-4 py-12 @[640px]:px-6 @[640px]:py-16">
    <div class="mx-auto max-w-4xl">
      <div class="relative overflow-hidden flex flex-col items-center justify-between gap-8 rounded-2xl border border-ivory-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] @[640px]:flex-row @[640px]:p-8">
        
        <!-- Left Side: Icon & Text -->
        <div class="relative z-10 flex flex-col items-center gap-4 text-center @[640px]:flex-row @[640px]:gap-6 @[640px]:text-left">
          <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-600">
            <Users class="h-8 w-8" />
          </div>
          <div>
            <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-600">Share Our Invitation</p>
            <h2 class="mt-2 font-display text-2xl text-ink-800">Scan to share with your<br class="hidden @[640px]:block">family &amp; friends</h2>
          </div>
        </div>

        <!-- Right Side: QR Code -->
        <div v-if="qrDataUrl" class="relative z-10 flex flex-col items-center gap-4 @[640px]:flex-row @[640px]:gap-6">
          <div class="rounded-xl border border-ivory-200 bg-white p-2">
            <img :src="qrDataUrl" alt="QR code to share invitation" width="100" height="100">
          </div>
          <div class="flex flex-col items-center text-center @[640px]:block @[640px]:max-w-[120px] @[640px]:text-left">
            <p class="text-xs font-medium leading-relaxed text-ink-700/60">Open Camera or QR Scanner</p>
            <!-- Decorative arrow -->
            <svg class="mt-2 h-6 w-10 text-gold-500/50 hidden @[640px]:block" viewBox="0 0 40 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M40 20 C25 20, 15 15, 10 5" />
              <path d="M5 10 L10 5 L15 10" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
