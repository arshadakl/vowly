<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import QRCode from 'qrcode'
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const shareUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/${props.invitation.slug}`
})

const qrDataUrl = ref('')

onMounted(() => {
  QRCode.toDataURL(shareUrl.value, {
    width: 240,
    margin: 1,
    color: { dark: '#300813', light: '#ffffff' },
  }).then((url) => {
    qrDataUrl.value = url
  })
})
</script>

<template>
  <div class="flex flex-col gap-6 @lg:gap-8 mt-6">
    <section class="fade-in-up" style="animation-delay: 0.8s;">
      <div class="glass-panel rounded-xl p-8 flex flex-col @md:flex-row items-center justify-center @md:justify-around gap-8 relative h-full">
        <div class="flex-1 text-center @md:text-left z-10">
          <p class="text-[10px] @lg:text-xs tracking-[0.25em] text-gold-400 mb-2 font-serif-cinzel uppercase">Share Our Invitation</p>
          <h3 class="text-2xl @lg:text-3xl font-serif-cinzel text-white mb-4">Scan to share with<br/>family &amp; friends</h3>
          <div class="ornament !justify-center @md:!justify-start mt-4 text-gold-400 text-xs w-full @md:w-1/2 mx-auto @md:mx-0">
            ✿
          </div>
        </div>
        
        <div class="flex flex-col @sm:flex-row items-center justify-center gap-6 z-10 w-full @md:w-auto">
          <div class="bg-white p-4 rounded-xl shadow-2xl shrink-0 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 cursor-pointer">
            <img v-if="qrDataUrl" :alt="`QR Code for ${invitation.brideName} & ${invitation.groomName}`" class="w-32 h-32 @lg:w-40 @lg:h-40" :src="qrDataUrl" />
            <div v-else class="w-32 h-32 @lg:w-40 @lg:h-40 bg-gray-100 animate-pulse rounded-lg"></div>
          </div>
          <div class="text-xs @lg:text-sm text-gold-200 text-center @sm:text-left flex flex-col items-center @sm:items-start gap-1.5 font-light">
            <span>Open Camera</span>
            <span class="opacity-75">or QR Scanner</span>
            <svg class="w-5 h-5 text-gold-400 rotate-[90deg] @sm:rotate-[0deg] mt-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path></svg>
          </div>
        </div>
        
        <div class="absolute -left-4 top-4 w-24 h-36 @lg:w-32 @lg:h-48 bg-contain bg-no-repeat opacity-40 pointer-events-none" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAJ85XNr5jjgKSVPfTuYp7epN8FSrOxQ-i8WFIq1vs1H164J38xYaSKPF0fxoKQDVtoiO8KbwvCRWo5eVQvj8hYsSZuVa6MnT0xcPvLp8Su109WVLlUZOcQVXB8zbfErL0XVf6fS2R1Ls8-mQ3ErBPMkmnaRSyPfAf0f-s2eIbWO434ZocTKxw0G_PbUj-qsAQ0jbeFlWZnY4D9OZbBhpQlBj57ZO4GbVMyrllDmXNVrudXuknceqnU');"></div>
      </div>
    </section>
  </div>
</template>
