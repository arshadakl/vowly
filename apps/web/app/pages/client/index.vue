<script setup lang="ts">
import type { EditorInvitation, RsvpData } from '~/types/client-wizard'
import type { TemplateId } from '@vowly/types'
import { Check, Copy, ExternalLink, Eye, Heart, LogOut, PencilLine } from 'lucide-vue-next'
import { invitationUpdateBody, previewInvitation } from '~/utils/template-preview'
import { templateDefinitions } from '~/utils/templates'
import TemplatePreviewModal from '~/components/client/TemplatePreviewModal.vue'

useSeoMeta({ title: 'Wedding invitation templates', robots: 'noindex, nofollow' })

const api = useApi()
const invitation = ref<EditorInvitation | null>(null)
const rsvps = ref<RsvpData | null>(null)
const loading = ref(true)
const openingEditor = ref<TemplateId | null>(null)
const previewTemplate = ref<TemplateId | null>(null)
const errorMessage = ref<string | null>(null)
const linkCopied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null
const requestUrl = useRequestURL()

try {
  invitation.value = await api<EditorInvitation>('/client/invitation')
  rsvps.value = await api<RsvpData>('/client/invitation/rsvps').catch(() => null)
} catch (error: unknown) {
  const apiError = error as { statusCode?: number; message?: string }
  if (apiError.statusCode === 401) await navigateTo('/login?redirect=%2Fclient')
  else errorMessage.value = apiError.message ?? 'Could not load your invitation.'
} finally {
  loading.value = false
}

const activeDefinition = computed(() =>
  templateDefinitions.find((definition) => definition.id === invitation.value?.template),
)
const shareableUrl = computed(() =>
  invitation.value?.published && invitation.value.slug
    ? `${requestUrl.origin}/${invitation.value.slug}`
    : null,
)
const previewSample = computed(() =>
  previewTemplate.value
    ? previewInvitation(previewTemplate.value, invitation.value, undefined, { sample: true })
    : null,
)

function openPreview(template: TemplateId) {
  previewTemplate.value = template
}

function closePreview() {
  previewTemplate.value = null
}

async function editPreviewTemplate() {
  if (!previewTemplate.value) return
  const template = previewTemplate.value
  closePreview()
  await selectTemplateAndEdit(template)
}

async function continueEditing() {
  if (!invitation.value?.template) {
    document.getElementById('template-gallery')?.scrollIntoView({ behavior: 'smooth' })
    errorMessage.value = 'Choose a template first, then continue editing your invitation.'
    return
  }
  // A document navigation avoids stale page payloads after the invitation
  // was just selected or updated and always opens the editor shell.
  window.location.assign('/client/editor')
}

async function selectTemplateAndEdit(template: TemplateId) {
  if (!invitation.value || invitation.value.locked) return
  if (
    invitation.value.published &&
    invitation.value.template !== template &&
    !window.confirm('This will change your live invitation immediately after saving. Continue?')
  )
    return
  openingEditor.value = template
  errorMessage.value = null
  try {
    invitation.value = await api<EditorInvitation>('/client/invitation', {
      method: 'PUT',
      body: invitationUpdateBody(invitation.value, template),
    })
    window.location.assign('/client/editor')
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not open this template.'
  } finally {
    openingEditor.value = null
  }
}

async function logout() {
  await api('/auth/client/logout', { method: 'POST' })
  await navigateTo('/login')
}

async function copyShareableLink() {
  if (!shareableUrl.value) return
  try {
    await navigator.clipboard.writeText(shareableUrl.value)
    linkCopied.value = true
    if (copiedTimer) clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (linkCopied.value = false), 2000)
  } catch {
    window.prompt('Copy your invitation link:', shareableUrl.value)
  }
}

onBeforeUnmount(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<template>
  <div class="client-dashboard min-h-screen bg-[#f7f5f2] text-slate-950">
    <header class="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
      <div class="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <NuxtLink to="/client" class="flex items-center gap-3">
          <span class="grid h-9 w-9 place-items-center rounded-full bg-rose-950 text-white">
            <Heart class="h-4 w-4" />
          </span>
          <span
            ><b class="block text-sm">Vowly</b
            ><small class="text-stone-500">Template studio</small></span
          >
        </NuxtLink>
        <button class="saas-icon-button" aria-label="Log out" @click="logout">
          <LogOut class="h-4 w-4" />
        </button>
      </div>
    </header>

    <main v-if="invitation" class="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
      <p
        v-if="errorMessage"
        class="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
        role="alert"
      >
        {{ errorMessage }}
      </p>
      <section class="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
        <div class="grid lg:grid-cols-[1fr_22rem]">
          <div class="p-6 sm:p-9">
            <p class="text-[.65rem] uppercase tracking-[.25em] text-amber-300">Your invitation</p>
            <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {{ invitation.brideName || 'Your names' }} &amp;
              {{ invitation.groomName || 'your partner' }}
            </h1>
            <div class="mt-4 flex flex-wrap gap-2 text-xs">
              <span class="rounded-full bg-white/10 px-3 py-1.5">{{
                invitation.published ? 'Published' : 'Draft'
              }}</span>
              <span v-if="activeDefinition" class="rounded-full bg-white/10 px-3 py-1.5">{{
                activeDefinition.name
              }}</span>
              <span
                v-else
                class="rounded-full bg-amber-300 px-3 py-1.5 font-semibold text-amber-950"
                >Template selection required</span
              >
              <span v-if="rsvps" class="rounded-full bg-white/10 px-3 py-1.5"
                >{{ rsvps.summary.total }} replies</span
              >
            </div>
            <p class="mt-5 max-w-xl text-sm leading-6 text-slate-300">
              {{
                invitation.locked
                  ? 'This invitation is read only because its editing period has ended.'
                  : 'Continue editing your details, styling, photos, events and RSVP settings at any time.'
              }}
            </p>
            <div class="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950"
                @click="continueEditing"
              >
                <PencilLine class="h-4 w-4" />
                {{ invitation.template ? 'Continue editing' : 'Choose a template' }}
              </button>
              <a
                v-if="invitation.published && invitation.slug"
                :href="`/${invitation.slug}`"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold"
                ><ExternalLink class="h-4 w-4" /> View live</a
              >
            </div>
            <div
              v-if="shareableUrl"
              class="mt-6 rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-4"
            >
              <p class="text-[.65rem] font-semibold uppercase tracking-[.18em] text-amber-300">
                Shareable invitation link
              </p>
              <div class="mt-2 flex items-center gap-2">
                <a
                  :href="shareableUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="min-w-0 flex-1 truncate text-sm text-white underline decoration-white/30 underline-offset-4"
                >
                  {{ shareableUrl }}
                </a>
                <button
                  type="button"
                  class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-950"
                  @click="copyShareableLink"
                >
                  <Check v-if="linkCopied" class="h-3.5 w-3.5 text-emerald-600" />
                  <Copy v-else class="h-3.5 w-3.5" />
                  {{ linkCopied ? 'Copied' : 'Copy link' }}
                </button>
              </div>
            </div>
          </div>
          <div class="min-h-48 p-5 lg:p-6">
            <div
              class="grid h-full place-items-center overflow-hidden rounded-2xl border border-white/10 p-8 text-center"
              :style="
                activeDefinition
                  ? {
                      background: activeDefinition.previewGradient,
                      color: activeDefinition.ogTheme.foreground,
                    }
                  : { background: '#28252c' }
              "
            >
              <div v-if="activeDefinition">
                <span class="text-4xl">{{ activeDefinition.motif }}</span>
                <p class="mt-4 text-2xl">{{ activeDefinition.name }}</p>
              </div>
              <div v-else>
                <span class="text-4xl">+</span>
                <p class="mt-3 text-sm text-slate-300">Choose a design below</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="template-gallery" class="mt-12 scroll-mt-24">
        <div class="max-w-2xl">
          <p class="text-xs font-semibold uppercase tracking-[.2em] text-rose-800">
            25 wedding designs
          </p>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight">
            Choose the feeling of your celebration
          </h2>
          <p class="mt-2 text-sm leading-6 text-stone-600">
            Preview any design safely, then choose Edit this template inside the preview. Your
            wedding details stay intact and saved styling returns when you revisit a design.
          </p>
        </div>
        <div
          class="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <article
            v-for="definition in templateDefinitions"
            :key="definition.id"
            class="group mx-auto w-full max-w-[320px] min-[480px]:max-w-none"
          >
            <button
              type="button"
              class="relative block aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] border-2 border-stone-200 bg-[#f6f2ea] text-left shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-emerald-700/60 group-hover:shadow-[0_22px_60px_rgba(15,56,44,0.16)] sm:rounded-[2rem] md:rounded-[2.25rem]"
              :aria-label="`Preview ${definition.name}`"
              @click="openPreview(definition.id)"
            >
              <div
                class="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                :style="{
                  backgroundColor: definition.ogTheme.background,
                  backgroundImage: `url(${definition.backgroundImage})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }"
              />
              <span
                class="absolute left-3 top-3 z-10 max-w-[65%] truncate rounded-full border border-white/60 bg-white/85 px-2.5 py-1 text-[10px] font-bold text-stone-900 shadow-sm backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[11px]"
              >
                {{ definition.name }}
              </span>
              <span
                class="absolute right-3 top-3 z-10 rounded-full bg-[#1b4332]/90 px-3 py-1.5 text-[11px] font-black text-white shadow-[0_6px_16px_rgba(0,0,0,0.25)] backdrop-blur sm:right-4 sm:top-4 sm:px-3.5 sm:text-xs"
              >
                Free ✨
              </span>
              <span class="absolute inset-x-3 bottom-3 z-10 sm:inset-x-4 sm:bottom-4">
                <span
                  class="flex h-11 w-full items-center justify-center gap-1.5 rounded-[1.1rem] border border-white/15 bg-black/60 text-[13px] font-bold text-white shadow-[0_10px_25px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-colors group-hover:bg-[#1b4332] sm:h-12 sm:rounded-[1.25rem] sm:text-sm md:h-14 md:rounded-2xl md:text-base"
                >
                  <Eye class="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  Preview Template
                </span>
              </span>
            </button>
          </article>
        </div>
      </section>
    </main>
    <div v-else-if="loading" class="grid min-h-[70vh] place-items-center text-sm text-stone-500">
      Loading your studio...
    </div>
    <div v-else class="grid min-h-[70vh] place-items-center p-6 text-center">
      <div>
        <h1 class="text-2xl font-semibold">Invitation unavailable</h1>
        <p class="mt-3 text-sm text-red-700">{{ errorMessage }}</p>
        <NuxtLink to="/login" class="saas-button mt-6">Return to login</NuxtLink>
      </div>
    </div>
    <TemplatePreviewModal
      v-if="previewTemplate && previewSample"
      :template="previewTemplate"
      :source="invitation"
      :opening="openingEditor === previewTemplate"
      @close="closePreview"
      @edit="editPreviewTemplate"
    />
  </div>
</template>
