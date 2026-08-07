<script setup lang="ts">
import { Check, Lock } from 'lucide-vue-next'
import type { ClientWizardStep } from '~/types/client-wizard'

defineProps<{
  activeStep: ClientWizardStep
  completion: Record<'couple' | 'events' | 'settings' | 'publish', boolean>
  canAccess: (step: ClientWizardStep) => boolean
}>()

const emit = defineEmits<{ select: [step: ClientWizardStep] }>()
const steps: Array<{
  id: ClientWizardStep
  title: string
  description: string
  key: 'couple' | 'events' | 'settings' | 'publish'
}> = [
  { id: 1, title: 'Couple Information', description: 'Tell us about the couple', key: 'couple' },
  { id: 2, title: 'Wedding Events', description: 'Add your events', key: 'events' },
  {
    id: 3,
    title: 'Template & Settings',
    description: 'Choose template and settings',
    key: 'settings',
  },
  {
    id: 4,
    title: 'Preview & Publish',
    description: 'Preview and publish invitation',
    key: 'publish',
  },
]
</script>

<template>
  <nav
    class="grid border-b border-ink-900/10 bg-white sm:grid-cols-4"
    aria-label="Invitation setup steps"
  >
    <button
      v-for="item in steps"
      :key="item.id"
      type="button"
      :disabled="!canAccess(item.id)"
      class="group relative flex items-center gap-3 px-4 py-5 text-left transition hover:bg-ivory-50 disabled:cursor-not-allowed disabled:opacity-55 sm:justify-center"
      :class="
        activeStep === item.id
          ? 'after:absolute after:inset-x-8 after:bottom-0 after:h-1 after:bg-gold-500'
          : ''
      "
      @click="emit('select', item.id)"
    >
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-200 text-sm font-semibold text-ink-700"
        :class="
          activeStep === item.id
            ? 'bg-gold-500 text-white'
            : completion[item.key]
              ? 'bg-[#4a9a68] text-white'
              : ''
        "
      >
        <Check v-if="completion[item.key] && activeStep !== item.id" class="h-5 w-5" />
        <Lock v-else-if="!canAccess(item.id)" class="h-4 w-4" />
        <span v-else>{{ item.id }}</span>
      </span>
      <span
        ><strong class="block text-sm text-ink-900">{{ item.title }}</strong
        ><small class="mt-1 block text-xs text-ink-700/65">{{
          completion[item.key] ? 'Completed' : item.description
        }}</small></span
      >
    </button>
  </nav>
</template>
