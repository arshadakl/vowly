<script setup lang="ts">
import QRCode from 'qrcode'

const props = defineProps<{ slug: string }>()

const shareUrl = computed(() => `https://vowly.app/${props.slug}`)
const qrDataUrl = ref('')

onMounted(() => {
  QRCode.toDataURL(shareUrl.value, {
    width: 180,
    margin: 2,
    color: { dark: '#2b2620', light: '#faf5ef' },
  }).then((url) => {
    qrDataUrl.value = url
  })
})
</script>

<template>
  <section class="bg-white px-6 py-16">
    <div class="mx-auto max-w-md text-center">
      <p class="text-xs uppercase tracking-[0.3em] text-gold-500">Share Our Invitation</p>
      <h2 class="mt-3 font-display text-2xl text-ink-800">Scan to share with your family &amp; friends</h2>

      <div v-if="qrDataUrl" class="mt-8 inline-block rounded-xl border border-ivory-200 bg-[#faf5ef] p-4">
        <img :src="qrDataUrl" alt="QR code to share invitation" width="180" height="180">
      </div>
      <p v-if="qrDataUrl" class="mt-4 text-xs text-ink-700/50">Open Camera or QR Scanner</p>
    </div>
  </section>
</template>
