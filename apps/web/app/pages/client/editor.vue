<script setup lang="ts">
import {
  DEFAULT_TEMPLATE_CUSTOMIZATION,
  type PublicInvitation,
  type TemplateTextStyle,
} from '@vowly/types'
import type { EditorInvitation } from '~/types/client-wizard'
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import { invitationUpdateBody, previewInvitation } from '~/utils/template-preview'
import EditorToolbar from '~/components/editor/EditorToolbar.vue'
import { getEditorCSSVars } from '~/components/editor/font-utils'

useSeoMeta({ title: 'Customize invitation', robots: 'noindex, nofollow' })

const api = useApi()
const invitation = ref<EditorInvitation | null>(null)
const savedInvitation = ref<EditorInvitation | null>(null)
const loading = ref(true)
const saving = ref(false)
const publishing = ref(false)
const uploading = ref(false)
const saveState = ref<'saved' | 'unsaved' | 'saving' | 'error'>('saved')
const message = ref<string | null>(null)
const errorMessage = ref<string | null>(null)
const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const hydrated = ref(false)
const applyingServerState = ref(false)

/**
 * Editor state is a deeply reactive Vue Proxy. Browser structuredClone()
 * rejects Proxy objects, while this data contract contains JSON values only.
 * Serializing the raw root safely unwraps every nested reactive collection.
 */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(toRaw(value))) as T
}

try {
  const loaded = await api<EditorInvitation>('/client/invitation')
  if (!loaded.template) await navigateTo('/client')
  else {
    invitation.value = clone(loaded)
    savedInvitation.value = clone(loaded)
  }
} catch (error: unknown) {
  const apiError = error as { statusCode?: number; message?: string }
  if (apiError.statusCode === 401) await navigateTo('/login?redirect=%2Fclient%2Feditor')
  else errorMessage.value = apiError.message ?? 'Could not open the editor.'
} finally {
  loading.value = false
  await nextTick()
  hydrated.value = true
}

const template = computed(() => invitation.value?.template ?? null)
const preview = computed<PublicInvitation | null>(() => {
  if (!invitation.value || !template.value) return null
  return previewInvitation(template.value, invitation.value, invitation.value.customization)
})

const editorCSSVars = computed(() =>
  invitation.value
    ? getEditorCSSVars({
        fontFamily: invitation.value.customization.fontFamily,
        fontSize: invitation.value.customization.fontSize,
      })
    : {},
)

watch(
  invitation,
  () => {
    if (
      !hydrated.value ||
      applyingServerState.value ||
      saving.value ||
      !invitation.value?.template ||
      invitation.value.locked
    )
      return
    saveState.value = 'unsaved'
    if (saveTimer.value) clearTimeout(saveTimer.value)
    saveTimer.value = setTimeout(() => void saveAll(false), 900)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (saveTimer.value) clearTimeout(saveTimer.value)
})

async function applyServerInvitation(value: EditorInvitation) {
  applyingServerState.value = true
  invitation.value = clone(value)
  savedInvitation.value = clone(value)
  // Let the deep watcher observe the replacement while suppression is active.
  await nextTick()
  applyingServerState.value = false
}

async function saveAll(showMessage = true) {
  if (!invitation.value?.template || invitation.value.locked || saving.value) return false
  if (!invitation.value.brideName.trim() || !invitation.value.groomName.trim()) {
    errorMessage.value = 'Both partner names are required.'
    saveState.value = 'error'
    return false
  }
  if (saveTimer.value) {
    clearTimeout(saveTimer.value)
    saveTimer.value = null
  }
  saving.value = true
  saveState.value = 'saving'
  errorMessage.value = null
  try {
    const snapshot = clone(invitation.value)
    if (!snapshot.template) throw new Error('Choose a template before saving.')
    const templateId = snapshot.template
    const customization = clone(snapshot.customization)
    const [saved] = await Promise.all([
      api<EditorInvitation>('/client/invitation', {
        method: 'PUT',
        body: invitationUpdateBody(snapshot),
      }),
      api('/client/invitation/customization', {
        method: 'PUT',
        body: { template: templateId, customization },
      }),
    ])
    saved.customization = clone(customization)
    saved.customizations[templateId] = clone(customization)
    await applyServerInvitation(saved)
    saveState.value = 'saved'
    if (showMessage) message.value = 'All changes saved.'
    return true
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not save your changes.'
    saveState.value = 'error'
    return false
  } finally {
    saving.value = false
  }
}

function updateInlineField(field: string, value: string) {
  if (!invitation.value) return
  if (field === 'brideName' || field === 'groomName') invitation.value[field] = value
  else if (field === 'brideParents' || field === 'groomParents' || field === 'quote')
    invitation.value[field] = value || null
  else if (field.startsWith('events.')) {
    const [, eventId, property] = field.split('.')
    const event = invitation.value.events.find((item) => item.id === eventId)
    if (event && property === 'title') event.title = value || 'Celebration'
    else if (event && property === 'venue') event.venue = value || null
    else if (event && property === 'address') event.address = value || null
  } else invitation.value.customization.text[field] = value
}

function updateInlineStyle(field: string, style: TemplateTextStyle) {
  if (invitation.value) invitation.value.customization.styles[field] = style
}

function addEvent() {
  if (!invitation.value) return
  invitation.value.events.push({
    id: crypto.randomUUID(),
    invitationId: invitation.value.id,
    title: 'New celebration',
    eventDate: invitation.value.weddingDate,
    startTime: null,
    endTime: null,
    venue: null,
    googleMapUrl: null,
    googleMapEmbedUrl: null,
    address: null,
    notes: null,
    sortOrder: invitation.value.events.length,
  })
}

function removeEvent(index: number) {
  if (!invitation.value) return
  const [removed] = invitation.value.events.splice(index, 1)
  invitation.value.events.forEach((event, eventIndex) => (event.sortOrder = eventIndex))
  if (removed && invitation.value.featuredVenueEventId === removed.id)
    invitation.value.featuredVenueEventId = null
}

function resetSaved() {
  if (savedInvitation.value) invitation.value = clone(savedInvitation.value)
}

function resetTypography() {
  if (!invitation.value) return
  invitation.value.customization = clone(DEFAULT_TEMPLATE_CUSTOMIZATION)
}

async function cropPhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const width = 1200
  const height = 1500
  const scale = Math.max(width / bitmap.width, height / bitmap.height)
  const sourceWidth = width / scale
  const sourceHeight = height / scale
  const sourceX = (bitmap.width - sourceWidth) / 2
  const sourceY = (bitmap.height - sourceHeight) / 2
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Photo editing is not supported in this browser.')
  context.drawImage(bitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height)
  bitmap.close()
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not prepare photo.'))),
      'image/jpeg',
      0.86,
    ),
  )
}

async function uploadPhoto(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !invitation.value) return
  if (!file.type.startsWith('image/') || file.size > 10_000_000) {
    errorMessage.value = 'Choose a JPG, PNG, WebP or AVIF image smaller than 10 MB.'
    return
  }
  uploading.value = true
  errorMessage.value = null
  try {
    const cropped = await cropPhoto(file)
    const signature = await api<{
      cloudName: string
      apiKey: string
      uploadPreset: string
      publicId: string
      timestamp: number
      overwrite: boolean
      signature: string
    }>('/client/invitation/media/signature', { method: 'POST' })
    const data = new FormData()
    data.append('file', cropped, 'couple-photo.jpg')
    data.append('api_key', signature.apiKey)
    data.append('timestamp', String(signature.timestamp))
    data.append('signature', signature.signature)
    data.append('public_id', signature.publicId)
    data.append('overwrite', 'false')
    data.append('upload_preset', signature.uploadPreset)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      {
        method: 'POST',
        body: data,
      },
    )
    if (!response.ok) throw new Error('Cloudinary rejected the photo upload.')
    const uploaded = (await response.json()) as {
      asset_id: string
      public_id: string
      version: number
      format: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'
      width: number
      height: number
      bytes: number
    }
    const saved = await api<EditorInvitation>('/client/invitation/media/confirm', {
      method: 'POST',
      body: {
        assetId: uploaded.asset_id,
        publicId: uploaded.public_id,
        version: uploaded.version,
        format: uploaded.format,
        width: uploaded.width,
        height: uploaded.height,
        bytes: uploaded.bytes,
      },
    })
    await applyServerInvitation(saved)
    message.value = 'Couple photo uploaded and cropped to portrait format.'
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not upload the photo.'
  } finally {
    uploading.value = false
  }
}

async function removePhoto() {
  if (!invitation.value || !window.confirm('Remove this couple photo from the invitation?')) return
  uploading.value = true
  try {
    const saved = await api<EditorInvitation>('/client/invitation/media', { method: 'DELETE' })
    await applyServerInvitation(saved)
    message.value = 'Couple photo removed.'
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not remove the photo.'
  } finally {
    uploading.value = false
  }
}

async function publish() {
  if (!invitation.value) return
  if (saveState.value !== 'saved' && !(await saveAll(false))) return
  publishing.value = true
  try {
    const result = await api<{ published: boolean; slug: string }>('/client/invitation/publish', {
      method: 'POST',
    })
    if (!result.published || !result.slug) throw new Error('Publishing did not return a public link.')
    window.location.assign('/client')
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not publish the invitation.'
  } finally {
    publishing.value = false
  }
}
</script>

<template>
  <div class="client-dashboard min-h-screen bg-slate-100 text-slate-950">
    <header class="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div
        class="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-3 px-3 sm:px-6"
      >
        <NuxtLink to="/client" class="inline-flex items-center gap-2 text-sm font-semibold"
          ><ArrowLeft class="h-4 w-4" />
          <span class="hidden sm:inline">All templates</span></NuxtLink
        >
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2
            class="h-4 w-4"
            :class="
              saveState === 'saved'
                ? 'text-emerald-500'
                : saveState === 'error'
                  ? 'text-red-500'
                  : 'text-amber-500'
            "
          />
          {{
            saveState === 'saving'
              ? 'Saving...'
              : saveState === 'unsaved'
                ? 'Unsaved changes'
                : saveState === 'error'
                  ? 'Save failed'
                  : 'Saved'
          }}
        </div>
        <div class="flex gap-2">
          <button
            class="saas-button-secondary hidden sm:inline-flex"
            :disabled="saving"
            @click="saveAll()"
          >
            <Save class="h-4 w-4" /> Save</button
          ><button
            class="saas-button"
            :disabled="saving || publishing || invitation?.locked"
            @click="publish"
          >
            {{ publishing ? 'Publishing...' : invitation?.published ? 'Update live' : 'Publish' }}
          </button>
        </div>
      </div>
      <p
        v-if="message"
        class="bg-emerald-50 px-4 py-2 text-center text-xs text-emerald-800"
        role="status"
      >
        {{ message }}
      </p>
      <p
        v-if="errorMessage"
        class="bg-red-50 px-4 py-2 text-center text-xs text-red-700"
        role="alert"
      >
        {{ errorMessage }}
      </p>
    </header>

    <main
      v-if="invitation && preview"
      class="mx-auto grid max-w-[1500px] gap-5 p-3 pb-28 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] lg:p-6 lg:pb-6"
    >
      <!-- Form controls — order-1 on mobile (top), order-2 on desktop (right) -->
      <section class="order-1 lg:order-2 space-y-4 sm:space-y-5">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[.18em] text-indigo-600">
            Couple and invitation
          </p>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <label class="text-sm font-medium"
              >Partner one<input
                v-model="invitation.brideName"
                maxlength="60"
                class="saas-input mt-1" /></label
            ><label class="text-sm font-medium"
              >Partner two<input
                v-model="invitation.groomName"
                maxlength="60"
                class="saas-input mt-1" /></label
            ><label class="text-sm font-medium"
              >Partner one parents<input
                v-model="invitation.brideParents"
                maxlength="160"
                class="saas-input mt-1" /></label
            ><label class="text-sm font-medium"
              >Partner two parents<input
                v-model="invitation.groomParents"
                maxlength="160"
                class="saas-input mt-1"
            /></label>
          </div>
          <label class="mt-4 block text-sm font-medium"
            >Quote or tagline<textarea
              v-model="invitation.quote"
              maxlength="300"
              rows="3"
              class="saas-input mt-1"
            />
          </label>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[.18em] text-indigo-600">Photo</p>
              <h2 class="mt-1 text-lg font-semibold">Couple portrait</h2>
            </div>
            <ImagePlus class="h-5 w-5 text-slate-400" />
          </div>
          <p class="mt-2 text-sm text-slate-500">
            Images are center-cropped to 4:5, reduced locally, then uploaded directly to Cloudinary.
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <label class="saas-button cursor-pointer"
              ><Upload class="h-4 w-4" />
              {{
                uploading
                  ? 'Working...'
                  : invitation.coupleImageUrl
                    ? 'Replace photo'
                    : 'Upload photo'
              }}<input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                class="sr-only"
                :disabled="uploading"
                @change="uploadPhoto" /></label
            ><button
              v-if="invitation.coupleImageUrl"
              type="button"
              class="saas-button-secondary text-red-700"
              :disabled="uploading"
              @click="removePhoto"
            >
              <Trash2 class="h-4 w-4" /> Remove</button
            ><label class="ml-auto flex items-center gap-2 text-sm"
              ><input v-model="invitation.showImages" type="checkbox" /> Show photo</label
            >
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[.18em] text-indigo-600">
                Schedule
              </p>
              <h2 class="mt-1 text-lg font-semibold">Wedding events</h2>
            </div>
            <button type="button" class="saas-button-secondary" @click="addEvent">
              <Plus class="h-4 w-4" /> Add event
            </button>
          </div>
          <div class="mt-4 space-y-4">
            <article
              v-for="(event, index) in invitation.events"
              :key="event.id"
              class="rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div class="flex items-center justify-between">
                <b class="text-sm">Event {{ index + 1 }}</b
                ><button
                  type="button"
                  class="saas-icon-button text-red-600"
                  aria-label="Remove event"
                  @click="removeEvent(index)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <label class="text-xs font-medium"
                  >Title<input
                    v-model="event.title"
                    maxlength="80"
                    class="saas-input mt-1" /></label
                ><label class="text-xs font-medium"
                  >Date<input
                    v-model="event.eventDate"
                    type="date"
                    class="saas-input mt-1" /></label
                ><label class="text-xs font-medium"
                  >Starts<input
                    v-model="event.startTime"
                    type="time"
                    class="saas-input mt-1" /></label
                ><label class="text-xs font-medium"
                  >Ends<input v-model="event.endTime" type="time" class="saas-input mt-1" /></label
                ><label class="text-xs font-medium sm:col-span-2"
                  >Venue<input
                    v-model="event.venue"
                    maxlength="120"
                    class="saas-input mt-1" /></label
                ><label class="text-xs font-medium sm:col-span-2"
                  >Address<textarea
                    v-model="event.address"
                    maxlength="500"
                    rows="2"
                    class="saas-input mt-1"
                  /></label
                ><label class="text-xs font-medium sm:col-span-2"
                  >Google Maps link<input
                    v-model="event.googleMapUrl"
                    type="url"
                    maxlength="500"
                    class="saas-input mt-1"
                    placeholder="https://maps.google.com/..."
                /></label>
              </div>
              <label class="mt-3 flex items-center gap-2 text-xs"
                ><input v-model="invitation.featuredVenueEventId" type="radio" :value="event.id" />
                Feature this venue</label
              >
            </article>
          </div>
        </div>
      </section>

      <!-- Phone preview — order-2 on mobile (bottom), order-1 on desktop (left) -->
      <section class="order-2 lg:order-1 w-full lg:sticky lg:top-24">
        <div class="w-full flex justify-center lg:justify-end">
          <div
            class="relative w-full max-w-[400px] sm:max-w-[400px] lg:max-w-[440px] shrink-0 rounded-[54px] sm:rounded-[58px] border-[10px] sm:border-[12px] border-[#0f172a] shadow-2xl shadow-slate-900/40 overflow-hidden transition-all"
            style="aspect-ratio: 393 / 852"
          >
            <!-- Dynamic Island -->
            <div class="absolute top-[6px] sm:top-2 left-1/2 -translate-x-1/2 w-[90px] sm:w-[100px] h-[23px] sm:h-7 bg-black rounded-full z-[70]" />

            <div
              class="absolute inset-0 overflow-y-auto overscroll-contain no-scrollbar pt-[28px] sm:pt-[34px] pb-4 sm:pb-6"
            >
              <div
                class="editor-preview-wrapper"
                :style="{
                  containerType: 'inline-size',
                  width: '100%',
                  maxWidth: '100%',
                  ...editorCSSVars,
                }"
                :data-hide-events="invitation.customization.showEvents ? undefined : 'true'"
                :data-hide-rsvp="invitation.rsvpEnabled ? undefined : 'true'"
              >
                <TemplateRenderer
                  :invitation="preview"
                  editable
                  @field="updateInlineField"
                  @style="updateInlineStyle"
                />
              </div>
            </div>

            <!-- Home Indicator -->
            <div class="absolute bottom-[10px] sm:bottom-[5px] left-1/2 -translate-x-1/2 w-[100px] sm:w-[72px] h-[7px] sm:h-[2.5px] rounded-full bg-white/40 z-[70]" />
          </div>
        </div>
        <p class="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
          <Eye class="h-4 w-4 text-emerald-700" />
          Live preview · tap any text to edit
        </p>
      </section>
    </main>

    <div v-else-if="loading" class="grid min-h-[70vh] place-items-center text-sm text-slate-500">
      Opening the editor...
    </div>
    <div v-else class="grid min-h-[70vh] place-items-center p-6 text-center text-red-700">
      {{ errorMessage ?? 'Choose a template before editing.' }}
    </div>

    <!-- Fixed bottom toolbar -->
    <EditorToolbar
      v-if="invitation"
      v-model:font-family="invitation.customization.fontFamily"
      v-model:font-size="invitation.customization.fontSize"
      v-model:show-events="invitation.customization.showEvents"
      v-model:rsvp-enabled="invitation.rsvpEnabled"
    />
  </div>
</template>


