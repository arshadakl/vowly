<script setup lang="ts">
import { Image, Lightbulb, Users } from 'lucide-vue-next'
import type { EditorInvitation } from '~/types/client-wizard'

const props = defineProps<{ draft: EditorInvitation; locked: boolean }>()
const draft = computed(() => props.draft)
</script>

<template>
  <section class="border border-ink-900/10 bg-white p-6 shadow-sm sm:p-8">
    <div class="flex items-start gap-4 border-b border-ink-900/10 pb-6">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ivory-100 text-gold-600"
        ><Users class="h-7 w-7"
      /></span>
      <div>
        <p class="text-[10px] uppercase tracking-[0.25em] text-gold-600">Step 1</p>
        <h2 class="mt-2 font-display text-4xl">Couple Information</h2>
        <p class="mt-1 text-sm text-ink-700">Share the basic details about the couple.</p>
      </div>
      <span class="ml-auto text-sm text-red-600">* Required</span>
    </div>
    <div class="mt-7 grid gap-5 sm:grid-cols-2">
      <label class="text-sm font-medium"
        >Bride Name <span class="text-red-600">*</span
        ><input
          v-model="draft.brideName"
          :disabled="locked"
          class="mt-2 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500"
          placeholder="Enter bride name"
      ></label>
      <label class="text-sm font-medium"
        >Groom Name <span class="text-red-600">*</span
        ><input
          v-model="draft.groomName"
          :disabled="locked"
          class="mt-2 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500"
          placeholder="Enter groom name"
      ></label>
    </div>
    <label class="mt-6 block text-sm font-medium"
      >Wedding Quote <span class="font-normal text-ink-700/60">(Optional)</span
      ><textarea
        v-model="draft.quote"
        :disabled="locked"
        maxlength="300"
        rows="4"
        class="mt-2 w-full resize-none border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500"
        placeholder="Write a beautiful quote for your invitation"
      /><span class="mt-1 block text-right text-xs text-ink-700/55"
        >{{ draft.quote?.length ?? 0 }}/300</span
      ></label
    >
    <div v-if="draft.showImages" class="mt-7 border-t border-ink-900/10 pt-6">
      <div class="flex items-center gap-2">
        <Image class="h-5 w-5 text-gold-600" />
        <h3 class="font-display text-2xl">Couple Photos</h3>
      </div>
      <p class="mt-1 text-sm text-ink-700/65">
        Photo uploads will be available when image storage is connected.
      </p>
      <div class="mt-5 grid gap-5 sm:grid-cols-2">
        <div
          class="flex min-h-44 flex-col items-center justify-center border border-dashed border-ink-900/20 bg-ivory-50 p-5 text-center"
        >
          <Image class="h-8 w-8 text-ink-700/35" /><strong class="mt-3 text-sm">Bride image</strong
          ><small class="mt-1 text-xs text-ink-700/60">Upload coming soon</small>
        </div>
        <div
          class="flex min-h-44 flex-col items-center justify-center border border-dashed border-ink-900/20 bg-ivory-50 p-5 text-center"
        >
          <Image class="h-8 w-8 text-ink-700/35" /><strong class="mt-3 text-sm">Groom image</strong
          ><small class="mt-1 text-xs text-ink-700/60">Upload coming soon</small>
        </div>
      </div>
    </div>
    <div
      class="mt-7 flex items-center gap-3 border border-gold-500/20 bg-gold-500/5 px-4 py-3 text-sm text-gold-600"
    >
      <Lightbulb class="h-5 w-5 shrink-0" />You can always change these details later.
    </div>
  </section>
</template>
