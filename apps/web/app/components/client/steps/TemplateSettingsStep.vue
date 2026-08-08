<script setup lang="ts">
import { CalendarDays, Image, Palette, QrCode } from 'lucide-vue-next'
import type { EditorInvitation } from '~/types/client-wizard'

const props = defineProps<{ draft: EditorInvitation; locked: boolean }>()
const draft = computed(() => props.draft)
</script>

<template>
  <section class="border border-ink-900/10 bg-white p-6 shadow-sm sm:p-8">
    <div class="flex items-start gap-4 border-b border-ink-900/10 pb-6">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ivory-100 text-gold-600"
        ><Palette class="h-7 w-7"
      /></span>
      <div>
        <p class="text-[10px] uppercase tracking-[0.25em] text-gold-600">Step 3</p>
        <h2 class="mt-2 font-display text-4xl">Template &amp; Settings</h2>
        <p class="mt-1 text-sm text-ink-700">Choose a template and configure invitation privacy.</p>
      </div>
    </div>
    <div class="mt-7">
      <h3 class="text-lg font-semibold">Choose Template</h3>
      <p class="mt-1 text-sm text-ink-700/65">Select a design that matches your style.</p>
      <div class="mt-5 grid gap-4 sm:grid-cols-2">
        <div
          class="min-h-32 border border-gold-500 bg-gold-500/5 p-5"
        >
          <span class="font-display text-2xl">Floral</span>
          <span class="mt-2 block text-sm text-ink-700/65">Warm ivory with gold accents and botanical charm.</span>
          <span class="mt-4 block text-xs font-semibold uppercase tracking-widest text-gold-600">Selected</span>
        </div>
      </div>
    </div>
    <div class="mt-8">
      <h3 class="text-lg font-semibold">Invitation Settings</h3>
      <div class="mt-4 divide-y divide-ink-900/10 border border-ink-900/10">
        <label class="flex items-center justify-between gap-4 p-5"
          ><span class="flex items-center gap-3"
            ><Image class="h-5 w-5 text-gold-600" /><span
              ><strong class="block text-sm">Display couple photos</strong
              ><small class="text-xs text-ink-700/65"
                >Keep this off if you prefer not to show photos.</small
              ></span
            ></span
          ><input
            v-model="draft.showImages"
            type="checkbox"
            :disabled="locked"
            class="h-5 w-5 accent-[#b08d57]" ></label
        ><label class="flex items-center justify-between gap-4 p-5"
          ><span class="flex items-center gap-3"
            ><QrCode class="h-5 w-5 text-gold-600" /><span
              ><strong class="block text-sm">Accept RSVPs</strong
              ><small class="text-xs text-ink-700/65"
                >Allow guests to respond from your invitation.</small
              ></span
            ></span
          ><input
            v-model="draft.rsvpEnabled"
            type="checkbox"
            :disabled="locked"
            class="h-5 w-5 accent-[#b08d57]"
        ></label>
        <div class="flex items-center gap-3 p-5 text-sm text-ink-700/65">
          <CalendarDays class="h-5 w-5 text-gold-600" />Countdown is included automatically with the
          wedding date.
        </div>
      </div>
    </div>
  </section>
</template>
