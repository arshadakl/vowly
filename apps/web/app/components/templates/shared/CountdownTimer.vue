<script setup lang="ts">
import { countdownParts } from '@vowly/utils'

const props = defineProps<{ target: string }>()

const now = ref(Date.now())
useIntervalFn(() => {
  now.value = Date.now()
}, 1000)

const parts = computed(() => countdownParts(props.target, now.value))
</script>

<template>
  <div class="text-center">
    <template v-if="parts.ended">
      <p class="font-display text-2xl md:text-3xl text-ink-800">
        Thank you for celebrating with us ❤️
      </p>
    </template>
    <template v-else>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
        <div
          v-for="item in [
            { value: parts.days, label: 'Days' },
            { value: parts.hours, label: 'Hours' },
            { value: parts.minutes, label: 'Minutes' },
            { value: parts.seconds, label: 'Seconds' },
          ]"
          :key="item.label"
          class="flex flex-col items-center rounded-lg border border-ink-800/10 p-3"
        >
          <span class="font-display text-3xl font-medium text-ink-900">{{ item.value }}</span>
          <span class="text-xs uppercase tracking-widest text-ink-700">{{ item.label }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
