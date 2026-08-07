<script setup lang="ts">
import { Check, Lock } from 'lucide-vue-next'
import type { ClientWizardStep } from '~/types/client-wizard'

defineProps<{
  activeStep: ClientWizardStep
  completion: Record<'couple' | 'events' | 'settings' | 'publish', boolean>
  canAccess: (step: ClientWizardStep) => boolean
}>()

const steps: Array<{
  id: ClientWizardStep
  title: string
  key: 'couple' | 'events' | 'settings' | 'publish'
}> = [
  { id: 1, title: 'Couple Information', key: 'couple' },
  { id: 2, title: 'Wedding Events', key: 'events' },
  { id: 3, title: 'Template & Settings', key: 'settings' },
  { id: 4, title: 'Preview & Publish', key: 'publish' },
]
const emit = defineEmits<{ select: [step: ClientWizardStep] }>()
</script>

<template>
  <aside class="border border-ink-900/10 bg-white p-6 shadow-sm">
    <h2 class="font-display text-2xl">Your Progress</h2>
    <div
      class="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-ivory-200 text-center"
      :style="{
        borderRightColor: '#b08d57',
        transform: `rotate(${(Object.values(completion).filter(Boolean).length / 4) * 270 - 45}deg)`,
      }"
    >
      <span
        class="font-display text-3xl"
        :style="{
          transform: `rotate(-${(Object.values(completion).filter(Boolean).length / 4) * 270 - 45}deg)`,
        }"
        >{{ Math.round((Object.values(completion).filter(Boolean).length / 4) * 100) }}%</span
      >
    </div>
    <p class="mt-4 text-center text-sm font-medium text-gold-600">
      {{ Object.values(completion).filter(Boolean).length }} of 4 completed
    </p>
    <div class="mt-6 divide-y divide-ink-900/10 border-t border-ink-900/10">
      <button
        v-for="item in steps"
        :key="item.id"
        type="button"
        :disabled="!canAccess(item.id)"
        class="flex w-full items-center gap-3 py-4 text-left disabled:cursor-not-allowed disabled:opacity-55"
        @click="emit('select', item.id)"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-ivory-200 text-xs"
          :class="
            activeStep === item.id
              ? 'bg-gold-500 text-white'
              : completion[item.key]
                ? 'bg-[#4a9a68] text-white'
                : ''
          "
          ><Check v-if="completion[item.key]" class="h-4 w-4" /><Lock
            v-else-if="!canAccess(item.id)"
            class="h-3.5 w-3.5"
          /><span v-else>{{ item.id }}</span></span
        >
        <span
          ><strong class="block text-sm">{{ item.title }}</strong
          ><small class="text-xs text-ink-700/65">{{
            completion[item.key] ? 'Completed' : activeStep === item.id ? 'In progress' : 'Pending'
          }}</small></span
        >
      </button>
    </div>
  </aside>
</template>
