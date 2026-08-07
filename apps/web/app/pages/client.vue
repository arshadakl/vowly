<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import type { ClientWizardStep, EditorInvitation, RsvpData } from '~/types/client-wizard'
import { toRaw } from 'vue'
import { useClientWizard } from '~/composables/useClientWizard'
import CoupleInformationStep from '~/components/client/steps/CoupleInformationStep.vue'
import WeddingEventsStep from '~/components/client/steps/WeddingEventsStep.vue'
import TemplateSettingsStep from '~/components/client/steps/TemplateSettingsStep.vue'
import PreviewPublishStep from '~/components/client/steps/PreviewPublishStep.vue'
import ClientProgressStepper from '~/components/client/ClientProgressStepper.vue'
import ClientProgressCard from '~/components/client/ClientProgressCard.vue'

useSeoMeta({ title: 'Invitation Studio', robots: 'noindex, nofollow' })

const api = useApi()
const route = useRoute()
const router = useRouter()
const invitation = ref<EditorInvitation | null>(null)
const draft = ref<EditorInvitation | null>(null)
const rsvps = ref<RsvpData | null>(null)
const loading = ref(true)
const saving = ref(false)
const ready = ref(false)
const noInvitation = ref(false)
const errorMessage = ref<string | null>(null)
const notice = ref<string | null>(null)
const lastSavedAt = ref<string | null>(null)
const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const snapshot = ref<string | null>(null)

function cloneInvitation(value: EditorInvitation): EditorInvitation {
  const raw = toRaw(value)
  return { ...raw, events: raw.events.map((event) => ({ ...toRaw(event) })) }
}

function draftSnapshot(value: EditorInvitation): string {
  const raw = toRaw(value)
  return JSON.stringify({
    brideName: raw.brideName,
    groomName: raw.groomName,
    quote: raw.quote,
    template: raw.template,
    showImages: raw.showImages,
    rsvpEnabled: raw.rsvpEnabled,
    events: raw.events,
  })
}

try {
  invitation.value = await api<EditorInvitation>('/client/invitation')
  draft.value = cloneInvitation(invitation.value)
  snapshot.value = draftSnapshot(invitation.value)
  try {
    rsvps.value = await api<RsvpData>('/client/invitation/rsvps')
  } catch (error: unknown) {
    const apiError = error as { statusCode?: number; message?: string }
    if (apiError.statusCode === 401) await navigateTo('/login?redirect=%2Fclient')
    else errorMessage.value = apiError.message ?? 'Could not load RSVP responses.'
  }
} catch (error: unknown) {
  const apiError = error as { statusCode?: number; message?: string }
  if (apiError.statusCode === 401) await navigateTo('/login?redirect=%2Fclient')
  else if (apiError.statusCode === 404) noInvitation.value = true
  else errorMessage.value = apiError.message ?? 'Could not load your invitation.'
} finally {
  loading.value = false
  ready.value = true
}

const { activeStep, completion, canAccess, goToStep } = useClientWizard(draft)
const initialStep = Number(route.query.step)
if (draft.value && [1, 2, 3, 4].includes(initialStep)) goToStep(initialStep as ClientWizardStep)

watch(
  draft,
  () => {
    if (!ready.value || saving.value || !draft.value || draft.value.locked) return
    const current = draftSnapshot(draft.value)
    if (current === snapshot.value) return
    if (saveTimer.value) clearTimeout(saveTimer.value)
    saveTimer.value = setTimeout(() => void saveDraft(false), 800)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (saveTimer.value) clearTimeout(saveTimer.value)
})

async function saveDraft(showNotice = true) {
  if (!draft.value || draft.value.locked || saving.value) return false
  saving.value = true
  errorMessage.value = null
  try {
    const saved = await api<EditorInvitation>('/client/invitation', {
      method: 'PUT',
      body: {
        brideName: draft.value.brideName,
        groomName: draft.value.groomName,
        quote: draft.value.quote,
        template: draft.value.template,
        showImages: draft.value.showImages,
        rsvpEnabled: draft.value.rsvpEnabled,
        events: draft.value.events,
      },
    })
    invitation.value = saved
    draft.value = cloneInvitation(saved)
    snapshot.value = draftSnapshot(saved)
    lastSavedAt.value = new Date().toISOString()
    if (showNotice) notice.value = 'All changes saved.'
    return true
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not save invitation.'
    return false
  } finally {
    saving.value = false
  }
}

async function selectStep(step: ClientWizardStep) {
  if (!canAccess(step)) return
  goToStep(step)
  await router.replace({ query: { ...route.query, step: String(step) } })
}

async function saveAndContinue() {
  if (!draft.value) return
  const next = Math.min(4, activeStep.value + 1) as ClientWizardStep
  if (activeStep.value === 1 && (!draft.value.brideName.trim() || !draft.value.groomName.trim())) {
    errorMessage.value = 'Add both names before continuing.'
    return
  }
  if (activeStep.value === 2 && !draft.value.events.length) {
    errorMessage.value = 'Add at least one wedding event before continuing.'
    return
  }
  if (!(await saveDraft())) return
  await selectStep(next)
}

async function publish() {
  if (!draft.value || !(await saveDraft(false))) return
  saving.value = true
  try {
    const result = await api<{ published: boolean; slug?: string }>('/client/invitation/publish', {
      method: 'POST',
    })
    draft.value.published = result.published
    if (result.slug) draft.value.slug = result.slug
    notice.value = result.slug ? `Published at /${result.slug}` : 'Invitation published.'
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not publish invitation.'
  } finally {
    saving.value = false
  }
}

const preview = computed<PublicInvitation | null>(() => {
  if (!draft.value) return null
  return {
    id: draft.value.id,
    brideName: draft.value.brideName,
    groomName: draft.value.groomName,
    slug: draft.value.slug ?? 'preview',
    template: draft.value.template,
    quote: draft.value.quote,
    coverImage: null,
    brideImage: draft.value.showImages ? draft.value.brideImage : null,
    groomImage: draft.value.showImages ? draft.value.groomImage : null,
    showImages: draft.value.showImages,
    weddingDate: draft.value.weddingDate,
    weddingTz: draft.value.weddingTz,
    events: draft.value.events,
    rsvp: { enabled: draft.value.rsvpEnabled },
    ogImageUrl: draft.value.ogImageUrl,
    studio: { name: 'Vowly', instagram: null, phone: null },
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#f3efe6] text-ink-900">
    <header class="border-b border-ink-900/10 bg-white px-5 py-5 sm:px-10">
      <div class="mx-auto flex max-w-[1500px] items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="text-4xl text-gold-500">♡</div>
          <div>
            <p class="font-display text-2xl leading-none">Wedding Invitation</p>
            <p class="mt-1 text-sm text-ink-700/65">Create your beautiful invitation</p>
          </div>
        </div>
        <div class="flex items-center gap-5">
          <span class="hidden text-sm text-[#3f8758] sm:block"
            >✓
            <span class="text-ink-700">{{
              saving ? 'Saving...' : lastSavedAt ? 'Auto saved' : 'Not saved yet'
            }}</span></span
          ><button
            class="lumiere-button"
            :disabled="saving || !draft || draft.locked"
            @click="saveAndContinue"
          >
            {{ saving ? 'Saving...' : 'Save & Continue' }}
          </button>
        </div>
      </div>
    </header>
    <ClientProgressStepper
      v-if="draft"
      :active-step="activeStep"
      :completion="completion"
      :can-access="canAccess"
      @select="selectStep"
    />
    <main
      v-if="!loading && draft"
      class="mx-auto grid max-w-[1500px] gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px]"
    >
      <div>
        <p
          v-if="notice"
          class="mb-4 border-l-2 border-gold-500 bg-white px-4 py-3 text-sm text-ink-700"
        >
          {{ notice }}
        </p>
        <p
          v-if="errorMessage"
          class="mb-4 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ errorMessage }}
        </p>
        <CoupleInformationStep
          v-if="activeStep === 1"
          :draft="draft"
          :locked="draft.locked"
        /><WeddingEventsStep
          v-else-if="activeStep === 2"
          :draft="draft"
          :locked="draft.locked"
        /><TemplateSettingsStep
          v-else-if="activeStep === 3"
          :draft="draft"
          :locked="draft.locked"
        /><PreviewPublishStep
          v-else
          :draft="draft"
          :preview="preview"
          :locked="draft.locked"
          :saving="saving"
          @publish="publish"
          @back="selectStep(3)"
        />
        <div
          v-if="activeStep !== 4"
          class="mt-5 flex items-center justify-between border border-ink-900/10 bg-white px-5 py-4"
        >
          <button
            v-if="activeStep > 1"
            class="lumiere-button-secondary"
            @click="selectStep((activeStep - 1) as ClientWizardStep)"
          >
            ← Back</button
          ><span v-else /><button
            class="lumiere-button"
            :disabled="draft.locked || saving"
            @click="saveAndContinue"
          >
            Save &amp; Continue →
          </button>
        </div>
      </div>
      <div>
        <ClientProgressCard
          :active-step="activeStep"
          :completion="completion"
          :can-access="canAccess"
          @select="selectStep"
        />
        <div v-if="rsvps" class="mt-5 border border-ink-900/10 bg-white p-5">
          <p class="font-display text-2xl">Guest responses</p>
          <p class="mt-2 text-sm text-ink-700/65">
            {{ rsvps.summary.total }} responses · {{ rsvps.summary.guests }} guests
          </p>
        </div>
      </div>
    </main>
    <div
      v-else-if="noInvitation || errorMessage"
      class="flex min-h-[70vh] items-center justify-center px-6 text-center"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-red-600">Invitation studio unavailable</p>
        <h1 class="mt-3 font-display text-4xl">
          {{ errorMessage ?? 'Your invitation is being prepared.' }}
        </h1>
        <NuxtLink to="/login" class="lumiere-button mt-6">Return to login</NuxtLink>
      </div>
    </div>
    <div v-else class="p-16 text-center text-sm text-ink-700/65">Loading invitation studio...</div>
  </div>
</template>
