<script setup lang="ts">
import type { Ref } from 'vue'
import { inject } from 'vue'
import { Calendar, Clock, Heart, Sparkles } from 'lucide-vue-next'

export type CelebrationTheme =
  | 'gold'
  | 'dark-gold'
  | 'crimson'
  | 'emerald'
  | 'rose'
  | 'navy'
  | 'dark'
  | 'light'

const props = withDefaults(
  defineProps<{
    theme?: CelebrationTheme
    showEvents?: boolean
  }>(),
  { theme: 'light', showEvents: true },
)

const dateValue = computed(() => {
  const inv = inject<Ref<any>>('invitation')
  const val = inv?.value
  if (!val?.weddingDate) return 'Saturday, 12 December 2026'
  return formatDate(val.weddingDate)
})

const events = computed(() => {
  const inv = inject<Ref<any>>('invitation')
  const val = inv?.value
  const firstEvent = val?.events?.[0]
  return [
    {
      id: 'date',
      icon: Calendar,
      label: 'The Date',
      labelField: 'eventDateLabel',
      value: dateValue.value,
      valueField: 'weddingDateFormatted',
      note: 'Auspicious day of celebration',
      noteField: 'eventDateNote',
    },
    {
      id: 'ceremony',
      icon: Clock,
      label: 'Ceremony & Muhurtham',
      labelField: 'ceremonyLabel',
      value: firstEvent?.startTime ? `${formatTime(firstEvent.startTime)} – ${formatTime(firstEvent.endTime)}` : '10:00 AM – 11:30 AM',
      valueField: 'weddingTime',
      note: 'Solemnization of marriage & blessings',
      noteField: 'ceremonyNote',
    },
    {
      id: 'reception',
      icon: Heart,
      label: 'Reception & Feast',
      labelField: 'receptionLabel',
      value: '12:30 PM Onwards',
      valueField: 'receptionTime',
      note: 'Followed by lunch & celebration',
      noteField: 'receptionNote',
    },
  ]
})

function formatDate(value: string) {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year ?? 2000, (month ?? 1) - 1, day ?? 1)))
}

function formatTime(value: string | null | undefined) {
  if (!value) return ''
  const [hours = 0, minutes = 0] = value.split(':').map(Number)
  return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(2000, 0, 1, hours, minutes),
  )
}

const themeClasses = computed(() => {
  const t = props.theme
  const themes: Record<CelebrationTheme, Record<string, string>> = {
    gold: {
      card: 'bg-[#1A1309] border-[#D4AF37]/40 text-[#F5EBE0] shadow-2xl',
      inner: 'border-[#D4AF37]/25',
      divider: 'text-[#D4AF37]/40',
      icon: 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#F4E096]',
      title: 'text-[#F4E096]',
      label: 'text-[#D4AF37]',
      value: 'text-[#FFFFFF]',
      note: 'text-[#D8C7A5]',
      sparkle: 'text-[#E5C158]',
    },
    'dark-gold': {
      card: 'bg-[#0C1B17] border-[#D4AF37]/35 text-[#F7F5F0] shadow-2xl',
      inner: 'border-[#D4AF37]/20',
      divider: 'text-[#D4AF37]/35',
      icon: 'border-[#D4AF37]/35 bg-[#D4AF37]/15 text-[#F4E096]',
      title: 'text-[#F4E096]',
      label: 'text-[#D4AF37]',
      value: 'text-[#FFFFFF]',
      note: 'text-[#B0C4BF]',
      sparkle: 'text-[#D4AF37]',
    },
    crimson: {
      card: 'bg-[#FFFDFB] border-rose-900/25 text-[#2B1B17] shadow-xl',
      inner: 'border-rose-900/15',
      divider: 'text-rose-900/30',
      icon: 'border-rose-900/25 bg-rose-50 text-rose-900',
      title: 'text-rose-950',
      label: 'text-rose-900',
      value: 'text-[#1E080B]',
      note: 'text-[#6E4B43]',
      sparkle: 'text-rose-800',
    },
    emerald: {
      card: 'bg-[#0B211A] border-emerald-500/35 text-[#E6F4F0] shadow-2xl',
      inner: 'border-emerald-500/25',
      divider: 'text-emerald-500/35',
      icon: 'border-emerald-500/35 bg-emerald-500/15 text-emerald-300',
      title: 'text-emerald-100',
      label: 'text-emerald-400',
      value: 'text-[#FFFFFF]',
      note: 'text-emerald-200',
      sparkle: 'text-emerald-400',
    },
    rose: {
      card: 'bg-[#FFFBFB] border-rose-200/90 text-stone-800 shadow-xl',
      inner: 'border-rose-200/70',
      divider: 'text-rose-400/40',
      icon: 'border-rose-200 bg-rose-50 text-rose-700',
      title: 'text-rose-950',
      label: 'text-rose-800',
      value: 'text-stone-900',
      note: 'text-stone-600',
      sparkle: 'text-rose-500',
    },
    navy: {
      card: 'bg-[#0A1628] border-amber-400/35 text-slate-100 shadow-2xl',
      inner: 'border-amber-400/25',
      divider: 'text-amber-400/35',
      icon: 'border-amber-400/35 bg-amber-400/15 text-amber-300',
      title: 'text-amber-100',
      label: 'text-amber-400',
      value: 'text-[#FFFFFF]',
      note: 'text-slate-300',
      sparkle: 'text-amber-400',
    },
    dark: {
      card: 'bg-[#18181B] border-amber-500/35 text-zinc-100 shadow-2xl',
      inner: 'border-amber-500/25',
      divider: 'text-amber-500/35',
      icon: 'border-amber-500/35 bg-amber-500/15 text-amber-300',
      title: 'text-amber-100',
      label: 'text-amber-400',
      value: 'text-[#FFFFFF]',
      note: 'text-zinc-300',
      sparkle: 'text-amber-400',
    },
    light: {
      card: 'bg-white border-stone-200/90 text-stone-800 shadow-xl',
      inner: 'border-stone-200/80',
      divider: 'text-stone-400/40',
      icon: 'border-stone-200 bg-stone-50 text-stone-700',
      title: 'text-stone-900',
      label: 'text-stone-700',
      value: 'text-stone-900',
      note: 'text-stone-600',
      sparkle: 'text-amber-500',
    },
  }
  return themes[t] ?? themes.light
})
</script>

<template>
  <section v-if="showEvents" class="w-full my-8 sm:my-14 px-2.5 sm:px-5">
    <div class="mx-auto max-w-lg text-center">
      <!-- Section Header -->
      <div class="mb-6 sm:mb-8 flex flex-col items-center">
        <div class="mb-2.5 flex items-center justify-center gap-2.5">
          <span class="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-current to-transparent opacity-40" :class="themeClasses.divider" />
          <Sparkles class="h-3.5 w-3.5" :class="themeClasses.sparkle" />
          <span class="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent via-current to-transparent opacity-40" :class="themeClasses.divider" />
        </div>
        <p class="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.28em]" :class="themeClasses.label">
          PROGRAM OF CELEBRATIONS
        </p>
        <h2 class="mt-1.5 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" :class="themeClasses.title">
          Wedding Celebrations
        </h2>
      </div>

      <!-- Celebrations Card -->
      <div class="relative rounded-[28px] sm:rounded-[34px] border p-5 sm:p-7 md:p-8 transition-all" :class="themeClasses.card">
        <div class="rounded-2xl sm:rounded-3xl border p-4 sm:p-6" :class="themeClasses.inner">
          <template v-for="(item, idx) in events" :key="item.id">
            <!-- Divider between events -->
            <div v-if="idx > 0" class="flex items-center justify-center gap-2.5 my-4 sm:my-5 opacity-70">
              <span class="h-px w-14 sm:w-20 bg-gradient-to-r from-transparent to-current" :class="themeClasses.divider" />
              <span class="text-[9px] sm:text-[10px]" :class="themeClasses.sparkle">✦</span>
              <span class="h-px w-14 sm:w-20 bg-gradient-to-l from-transparent to-current" :class="themeClasses.divider" />
            </div>

            <!-- Event Item -->
            <div class="flex flex-col items-center text-center group">
              <div class="mb-2.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-transform duration-300 group-hover:scale-105" :class="themeClasses.icon">
                <component :is="item.icon" class="h-4 w-4" :stroke-width="1.6" />
              </div>
              <span class="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-[0.22em]" :class="themeClasses.label">
                {{ item.label }}
              </span>
              <span class="mt-1 text-lg sm:text-xl md:text-2xl font-bold tracking-tight leading-snug" :class="themeClasses.value">
                {{ item.value }}
              </span>
              <p v-if="item.note" class="mt-1 max-w-xs text-[11px] sm:text-[12.5px] font-medium leading-relaxed italic" :class="themeClasses.note">
                {{ item.note }}
              </p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
