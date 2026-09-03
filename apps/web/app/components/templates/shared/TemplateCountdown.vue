<script setup lang="ts">
import { countdownParts, startOfLocalDate } from '@vowly/utils'

const props = defineProps<{ date: string; timeZone: string; time?: string | null }>()
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
</script>

<template>
  <div
    style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.625rem"
    aria-label="Wedding countdown"
  >
    <div
      v-for="item in items"
      :key="item.label"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 1rem;
        border: 1px solid rgba(168, 162, 158, 0.3);
        background: rgba(255, 255, 255, 0.9);
        padding: 0.875rem 0.25rem;
        text-align: center;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
      "
    >
      <span
        style="
          display: block;
          font-size: 1.5rem;
          line-height: 1;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          color: #4A171F;
        "
      >{{ String(item.value).padStart(2, '0') }}</span>
      <span
        style="
          display: block;
          margin-top: 0.25rem;
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #78716c;
        "
      >{{ item.label }}</span>
    </div>
  </div>
</template>
