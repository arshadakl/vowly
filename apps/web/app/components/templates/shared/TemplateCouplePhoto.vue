<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

export type PhotoTheme =
  | 'gold'
  | 'dark-gold'
  | 'dark'
  | 'rose'
  | 'crimson'
  | 'emerald'
  | 'navy'
  | 'light'

const props = withDefaults(
  defineProps<{
    photoUrl?: string
    defaultPhoto?: string
    groomName?: string
    brideName?: string
    photoTag?: string
    photoTitle?: string
    photoSubtitle?: string
    showPhotoSection?: boolean
    theme?: PhotoTheme
  }>(),
  {
    photoUrl: '',
    defaultPhoto: '',
    groomName: 'Groom',
    brideName: 'Bride',
    photoTag: 'Memories',
    photoTitle: 'Moments of Love',
    photoSubtitle: 'Captured memories on our journey to forever',
    showPhotoSection: true,
    theme: 'light',
  },
)

const activePhoto = computed(() => props.photoUrl || props.defaultPhoto)

const themeClasses = computed(() => {
  const t = props.theme
  const themes: Record<PhotoTheme, Record<string, string>> = {
    gold: {
      card: 'bg-[#18130B]/80 border-[#D4AF37]/30 text-[#F5EBE0]',
      border: 'border-[#D4AF37]/40',
      tag: 'bg-[#D4AF37]/10 text-[#F4E096]',
      title: 'text-[#F4E096]',
      subtitle: 'text-[#F5EBE0]/70',
      sparkle: 'text-[#D4AF37]',
    },
    'dark-gold': {
      card: 'bg-[#0B1E1A]/90 border-[#D4AF37]/25 text-[#F7F5F0]',
      border: 'border-[#D4AF37]/35',
      tag: 'bg-[#D4AF37]/10 text-[#F4E096]',
      title: 'text-[#F4E096]',
      subtitle: 'text-[#A3B8B5]',
      sparkle: 'text-[#D4AF37]',
    },
    dark: {
      card: 'bg-zinc-900/90 border-amber-500/25 text-zinc-100',
      border: 'border-amber-500/30',
      tag: 'bg-amber-500/10 text-amber-300',
      title: 'text-amber-100',
      subtitle: 'text-zinc-400',
      sparkle: 'text-amber-400',
    },
    rose: {
      card: 'bg-[#FFF9F9] border-rose-200/80 text-stone-800 shadow-sm',
      border: 'border-rose-300/60',
      tag: 'bg-rose-50 text-rose-800',
      title: 'text-rose-950',
      subtitle: 'text-rose-800/70',
      sparkle: 'text-rose-500',
    },
    crimson: {
      card: 'bg-[#FDFBF7] border-rose-900/20 text-stone-800 shadow-sm',
      border: 'border-rose-900/30',
      tag: 'bg-rose-50 text-rose-950',
      title: 'text-rose-950',
      subtitle: 'text-rose-900/70',
      sparkle: 'text-rose-800',
    },
    emerald: {
      card: 'bg-[#0E241E]/80 border-emerald-500/25 text-emerald-50',
      border: 'border-emerald-500/35',
      tag: 'bg-emerald-500/10 text-emerald-300',
      title: 'text-emerald-100',
      subtitle: 'text-emerald-200/70',
      sparkle: 'text-emerald-400',
    },
    navy: {
      card: 'bg-[#0A1628]/90 border-amber-400/25 text-slate-100',
      border: 'border-amber-400/35',
      tag: 'bg-amber-400/10 text-amber-300',
      title: 'text-amber-200',
      subtitle: 'text-slate-300',
      sparkle: 'text-amber-400',
    },
    light: {
      card: 'bg-white/90 border-stone-200 text-stone-800 shadow-md backdrop-blur-sm',
      border: 'border-stone-300',
      tag: 'bg-stone-100 text-stone-700',
      title: 'text-stone-900',
      subtitle: 'text-stone-600',
      sparkle: 'text-amber-500',
    },
  }
  return themes[t] ?? themes.light
})
</script>

<template>
  <section v-if="showPhotoSection" class="w-full my-10 sm:my-14 px-2 sm:px-4">
    <div class="relative mx-auto max-w-lg rounded-3xl border p-5 sm:p-7 text-center transition-all" :class="themeClasses.card">
      <!-- Header -->
      <div class="mb-5 flex flex-col items-center">
        <div class="mb-2 flex items-center justify-center gap-2">
          <Sparkles class="h-4 w-4" :class="themeClasses.sparkle" />
          <span class="rounded-full px-3 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest" :class="themeClasses.tag">
            {{ photoTag }}
          </span>
          <Sparkles class="h-4 w-4" :class="themeClasses.sparkle" />
        </div>
        <h3 class="text-xl sm:text-2xl font-bold tracking-tight" :class="themeClasses.title">
          {{ photoTitle }}
        </h3>
        <p class="mt-1 text-xs sm:text-sm font-light max-w-xs leading-relaxed" :class="themeClasses.subtitle">
          {{ photoSubtitle }}
        </p>
      </div>

      <!-- Photo Frame -->
      <div v-if="activePhoto" class="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden p-2 border shadow-lg group" :class="themeClasses.border">
        <div class="relative h-full w-full rounded-xl sm:rounded-2xl overflow-hidden border" :class="themeClasses.border">
          <img
            :src="activePhoto"
            :alt="`${groomName} & ${brideName}`"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          >
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
        </div>
      </div>
    </div>
  </section>
</template>
