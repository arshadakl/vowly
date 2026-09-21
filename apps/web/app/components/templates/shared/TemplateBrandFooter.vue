<script setup lang="ts">
import type { TemplateId } from '@vowly/types'
import { Instagram, MessageCircle } from 'lucide-vue-next'

const props = defineProps<{ template: TemplateId }>()

type BrandTheme = {
  background: string
  logo: '/logo/logo-000000.png' | '/logo/logo-e65345.png' | '/logo/logo-ffffff.png'
  social: string
}

const darkTemplateBackgrounds: Partial<Record<TemplateId, string>> = {
  'black-gold-silhouette': '#0a0a0a',
  'ivory-arch': '#0d1d31',
  'kerala-kasavu': '#351116',
  'modern-navy': '#3b4d66',
  'premium-floral': '#183c36',
  'royal-nikah': '#030a09',
}

const coralTemplates = new Set<TemplateId>([
  'lavender-blush-proposal',
  'pearl-blush-elegant',
  'pink-rose-sofa-romance',
  'romantic-blush',
  'watercolor-bliss',
])

const theme = computed<BrandTheme>(() => {
  const darkBackground = darkTemplateBackgrounds[props.template]
  if (darkBackground) {
    return {
      background: darkBackground,
      logo: '/logo/logo-ffffff.png',
      social: 'rgba(255, 255, 255, 0.78)',
    }
  }

  if (coralTemplates.has(props.template)) {
    return {
      background: '#fff8f5',
      logo: '/logo/logo-e65345.png',
      social: '#a3463d',
    }
  }

  return {
    background: '#fffdf9',
    logo: '/logo/logo-000000.png',
    social: '#2b2421',
  }
})
</script>

<template>
  <footer
    class="flex flex-col items-center gap-4 px-5 py-7 text-center"
    :style="{ backgroundColor: theme.background }"
  >
    <img :src="theme.logo" alt="Lace & Looms" class="h-8 w-auto max-w-[10rem] object-contain" />
    <nav class="flex items-center gap-3" aria-label="Lace & Looms social links">
      <a
        href="https://www.instagram.com/laceandlooms"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Lace & Looms on Instagram"
        :style="{ color: theme.social }"
      >
        <Instagram :size="15" :stroke-width="1.8" />
      </a>
      <a
        href="https://wa.me/919526936172"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Lace & Looms on WhatsApp"
        :style="{ color: theme.social }"
      >
        <MessageCircle :size="16" :stroke-width="1.8" />
      </a>
    </nav>
  </footer>
</template>
