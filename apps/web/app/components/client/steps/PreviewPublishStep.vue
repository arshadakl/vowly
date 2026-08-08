<script setup lang="ts">
import { CheckCircle2, ExternalLink, Link, Rocket } from 'lucide-vue-next'
import type { PublicInvitation } from '@vowly/types'
import type { EditorInvitation } from '~/types/client-wizard'

defineProps<{
  draft: EditorInvitation
  preview: PublicInvitation | null
  locked: boolean
  saving: boolean
}>()
const emit = defineEmits<{ publish: []; back: [] }>()
</script>

<template>
  <section class="border border-ink-900/10 bg-white p-6 shadow-sm sm:p-8">
    <div class="flex items-start gap-4 border-b border-ink-900/10 pb-6">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-ivory-100 text-gold-600"
        ><Rocket class="h-7 w-7"
      /></span>
      <div>
        <p class="text-[10px] uppercase tracking-[0.25em] text-gold-600">Step 4</p>
        <h2 class="mt-2 font-display text-4xl">Preview &amp; Publish</h2>
        <p class="mt-1 text-sm text-ink-700">Review your invitation and publish it when ready.</p>
      </div>
    </div>
    <div class="mt-7 grid gap-6 lg:grid-cols-[1fr_280px]">
      <div class="border border-ink-900/10 bg-ivory-50 p-4 sm:p-8">
        <div class="mb-6 flex items-center justify-between">
          <h3 class="font-display text-2xl">Invitation Preview</h3>
          <span class="rounded-full bg-ivory-200 px-3 py-1 text-xs font-medium text-ink-700/65">{{ draft.template }}</span>
        </div>
        
        <!-- Mobile Device Mockup Frame -->
        <div class="mx-auto flex w-full max-w-[375px] justify-center">
          <div class="relative h-[750px] w-full overflow-hidden rounded-[2.5rem] border-[8px] border-ink-800 bg-white shadow-2xl ring-1 ring-ink-900/10">
            <!-- Simulated Notch -->
            <div class="absolute left-1/2 top-0 z-50 h-6 w-32 -translate-x-1/2 rounded-b-3xl bg-ink-800"></div>
            
            <!-- Scrollable Viewport -->
            <div class="h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth bg-white">
              <TemplateRenderer v-if="preview" :invitation="preview" />
            </div>
          </div>
        </div>
      </div>
      <aside class="space-y-4">
        <div class="border border-ink-900/10 p-5">
          <h3 class="font-display text-2xl">Invitation Summary</h3>
          <dl class="mt-5 space-y-4 text-sm">
            <div>
              <dt class="text-xs text-ink-700/60">Couple</dt>
              <dd class="mt-1 font-medium">{{ draft.brideName }} &amp; {{ draft.groomName }}</dd>
            </div>
            <div>
              <dt class="text-xs text-ink-700/60">Wedding date</dt>
              <dd class="mt-1 font-medium">{{ draft.weddingDate }}</dd>
            </div>
            <div>
              <dt class="text-xs text-ink-700/60">Events</dt>
              <dd class="mt-1 font-medium">{{ draft.events.length }} added</dd>
            </div>
            <div>
              <dt class="text-xs text-ink-700/60">Photos</dt>
              <dd class="mt-1 font-medium">{{ draft.showImages ? 'Enabled' : 'Hidden' }}</dd>
            </div>
          </dl>
        </div>
        <div class="border border-ink-900/10 p-5">
          <p class="flex items-center gap-2 text-sm font-medium">
            <Link class="h-4 w-4 text-gold-600" />Invitation Link
          </p>
          <p class="mt-2 break-all text-xs text-ink-700/65">
            {{ draft.slug ? `/${draft.slug}` : 'Will be generated after publishing' }}
          </p>
          <a
            v-if="draft.slug"
            :href="`/${draft.slug}`"
            target="_blank"
            class="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-gold-600"
            >Open invitation <ExternalLink class="h-3.5 w-3.5"
          /></a>
        </div>
      </aside>
    </div>
    <div class="mt-6 flex items-center justify-between border-t border-ink-900/10 pt-6">
      <button class="lumiere-button-secondary" @click="emit('back')">Back to Edit</button
      ><button
        class="lumiere-button"
        :disabled="locked || saving || draft.published"
        @click="emit('publish')"
      >
        <CheckCircle2 class="mr-2 h-4 w-4" />{{
          draft.published ? 'Published' : saving ? 'Publishing...' : 'Publish Invitation'
        }}
      </button>
    </div>
  </section>
</template>
