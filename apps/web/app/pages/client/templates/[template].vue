<script setup lang="ts">
import { templateIdSchema, type TemplateId } from '@vowly/types'
import type { EditorInvitation } from '~/types/client-wizard'
import { ArrowLeft, PencilLine } from 'lucide-vue-next'
import { invitationUpdateBody, previewInvitation } from '~/utils/template-preview'
import { templateDefinitions } from '~/utils/templates'

useSeoMeta({ title: 'Template preview', robots: 'noindex, nofollow' })

const route = useRoute()
const parsedTemplate = templateIdSchema.safeParse(route.params.template)
if (!parsedTemplate.success)
  throw createError({ statusCode: 404, statusMessage: 'Template not found' })
const template = parsedTemplate.data
const api = useApi()
const invitation = ref<EditorInvitation | null>(null)
const openingEditor = ref(false)
const errorMessage = ref<string | null>(null)

try {
  invitation.value = await api<EditorInvitation>('/client/invitation')
} catch (error: unknown) {
  const apiError = error as { statusCode?: number; message?: string }
  if (apiError.statusCode === 401)
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
  else errorMessage.value = apiError.message ?? 'Could not load this preview.'
}

const definition = templateDefinitions.find((item) => item.id === template)!
const sample = computed(() =>
  previewInvitation(template, invitation.value, undefined, { sample: true }),
)

async function editTemplate() {
  if (!invitation.value || invitation.value.locked) return
  if (
    invitation.value.published &&
    invitation.value.template !== template &&
    !window.confirm('This design will replace the template on your live invitation. Continue?')
  )
    return
  openingEditor.value = true
  try {
    invitation.value = await api<EditorInvitation>('/client/invitation', {
      method: 'PUT',
      body: invitationUpdateBody(invitation.value, template as TemplateId),
    })
    window.location.assign('/client/editor')
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not open this template.'
  } finally {
    openingEditor.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950">
    <header
      class="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/90 text-white backdrop-blur-xl"
    >
      <div class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <NuxtLink to="/client" class="inline-flex items-center gap-2 text-sm"
          ><ArrowLeft class="h-4 w-4" /> Templates</NuxtLink
        >
        <div class="min-w-0 text-center">
          <b class="block truncate text-sm">{{ definition.name }}</b
          ><small class="text-slate-400">Sample preview</small>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50"
          :disabled="!invitation || invitation.locked || openingEditor"
          @click="editTemplate"
        >
          <PencilLine class="h-3.5 w-3.5" />
          {{ openingEditor ? 'Opening editor...' : 'Edit this template' }}
        </button>
      </div>
      <p v-if="errorMessage" class="bg-red-900 px-4 py-2 text-center text-xs text-white">
        {{ errorMessage }}
      </p>
    </header>

    <!-- Phone Preview Frame -->
    <main class="flex items-start justify-center pt-24 pb-16 px-4">
      <div class="relative w-full max-w-[400px]">
        <!-- Glow background -->
        <div class="hidden md:block absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-emerald-500/20 via-amber-500/15 to-transparent blur-3xl pointer-events-none" />

        <!-- Phone frame -->
        <div
          class="phone-frame relative bg-[#111] overflow-hidden mx-auto border-[5px] sm:border-[8px] border-[#0d0d0d] ring-1 ring-white/10"
        >
          <!-- Status bar -->
          <div class="absolute top-0 left-0 right-0 h-[26px] sm:h-8 z-[65] flex items-center justify-between px-3.5 sm:px-6 text-white/80 text-[9px] sm:text-[11px] font-semibold bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

          <!-- Dynamic Island -->
          <div class="absolute top-[10px] sm:top-2 left-1/2 -translate-x-1/2 w-[100px] sm:w-28 h-[25px] sm:h-7 bg-black rounded-full z-[70] flex items-center justify-center">
            <div class="w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-[#1a1a1a] mr-1 sm:mr-2" />
          </div>

          <!-- Scrollable Template Content -->
          <div class="absolute inset-0 overflow-y-auto pt-[34px] sm:pt-[42px] pb-5 sm:pb-8" style="-webkit-overflow-scrolling: touch">
            <div style="container-type: inline-size; width: 100%; max-width: 100%">
              <TemplateRenderer v-if="sample" :invitation="sample" />
            </div>
          </div>

          <!-- Home Indicator -->
          <div class="absolute bottom-[10px] sm:bottom-2 left-1/2 -translate-x-1/2 w-[100px] sm:w-28 h-[6px] sm:h-1 rounded-full bg-white/40 z-[70]" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.phone-frame {
  border-radius: 2.4rem;
  max-width: 400px;
  height: 76vh;
  max-height: 780px;
  box-shadow: 0 60px 120px -20px rgba(0, 0, 0, 0.35);
}
@media (min-width: 640px) {
  .phone-frame {
    border-radius: 3rem;
    width: 400px;
    max-width: none;
    height: 860px;
    max-height: none;
  }
}
</style>
