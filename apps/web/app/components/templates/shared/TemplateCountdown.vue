<script setup lang="ts">
import { countdownParts, startOfLocalDate } from '@vowly/utils'

export type CountdownTheme = 'light' | 'dark' | 'crimson' | 'navy' | 'emerald' | 'gold'

const props = withDefaults(
  defineProps<{
    date: string
    timeZone: string
    time?: string | null
    theme?: CountdownTheme
  }>(),
  { theme: 'light' },
)
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (now.value = Date.now()), 1000)
})
onBeforeUnmount(() => timer && clearInterval(timer))
const target = computed(() => {
  const midnight = startOfLocalDate(props.date, props.timeZone)
  if (!props.time) return midnight
  const [hours = 0, minutes = 0] = props.time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return midnight
  return new Date(midnight.getTime() + (hours * 60 + minutes) * 60_000)
})
const parts = computed(() => countdownParts(target.value, new Date(now.value)))
const items = computed(() => [
  { label: 'Days', value: parts.value.days },
  { label: 'Hours', value: parts.value.hours },
  { label: 'Mins', value: parts.value.minutes },
  { label: 'Secs', value: parts.value.seconds },
])

const themeStyles = computed(() => {
  const themes: Record<CountdownTheme, { valueColor: string; labelColor: string; bg: string; border: string }> = {
    light: { valueColor: '#4A171F', labelColor: '#78716c', bg: 'rgba(255,255,255,0.9)', border: 'rgba(168,162,158,0.3)' },
    dark: { valueColor: '#F5EBE0', labelColor: '#A89878', bg: 'rgba(24,19,11,0.8)', border: 'rgba(212,175,55,0.3)' },
    crimson: { valueColor: '#8A212E', labelColor: '#8C6D65', bg: 'rgba(255,253,251,0.95)', border: 'rgba(128,0,32,0.15)' },
    navy: { valueColor: '#F4E096', labelColor: '#94A3B8', bg: 'rgba(17,35,62,0.85)', border: 'rgba(251,191,36,0.3)' },
    emerald: { valueColor: '#A7F3D0', labelColor: '#6EE7B7', bg: 'rgba(21,52,44,0.85)', border: 'rgba(52,211,153,0.3)' },
    gold: { valueColor: '#FAF5E6', labelColor: '#D8C7A5', bg: 'rgba(35,27,16,0.85)', border: 'rgba(212,175,55,0.3)' },
  }
  return themes[props.theme] ?? themes.light
})
</script>

<template>
  <div
    style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.625rem"
    aria-label="Wedding countdown"
  >
    <div
      v-for="item in items"
      :key="item.label"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: '1rem',
        border: `1px solid ${themeStyles.border}`,
        background: themeStyles.bg,
        padding: '0.875rem 0.25rem',
        textAlign: 'center',
        boxShadow: '0 8px 20px rgba(0,0,0,0.03)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }"
    >
      <span
        :style="{
          display: 'block',
          fontSize: '1.5rem',
          lineHeight: '1',
          fontWeight: '600',
          fontVariantNumeric: 'tabular-nums',
          color: themeStyles.valueColor,
        }"
      >{{ String(item.value).padStart(2, '0') }}</span>
      <span
        :style="{
          display: 'block',
          marginTop: '0.25rem',
          fontSize: '9.5px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: themeStyles.labelColor,
        }"
      >{{ item.label }}</span>
    </div>
  </div>
</template>
