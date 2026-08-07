<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { templateDefinitions } from '~/utils/templates'

useSeoMeta({ title: 'Invitation Studio', robots: 'noindex, nofollow' })
const api = useApi()
interface EditorInvitation extends Omit<PublicInvitation, 'slug'> {
  slug: string | null
  clientId: string
  editOverride: 'force_open' | 'force_locked' | null
  locked: boolean
  weddingTz: string
  published: boolean
  rsvpEnabled: boolean
  coverImage: string | null
  brideImage: string | null
  groomImage: string | null
}
const invitation = ref<EditorInvitation | null>(null)
const draft = ref<EditorInvitation | null>(null)
const loading = ref(true)
const noInvitation = ref(false)
const saving = ref(false)
const errorMessage = ref<string | null>(null)
const notice = ref<string | null>(null)
const device = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
interface RsvpData { summary: { total: number; yes: number; no: number; maybe: number; guests: number }; items: Array<{ id: string; guestName: string; status: string; guestCount: number; createdAt: string }> }
const rsvps = ref<RsvpData | null>(null)
const rsvpLoading = ref(true)

try {
  invitation.value = await api<EditorInvitation>('/client/invitation')
  draft.value = structuredClone(invitation.value)
  rsvps.value = await api<RsvpData>('/client/invitation/rsvps')
} catch (error: unknown) {
  const status = (error as { statusCode?: number }).statusCode
  if (status === 404) noInvitation.value = true
  else await navigateTo('/login')
} finally {
  loading.value = false
  rsvpLoading.value = false
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
    coverImage: draft.value.coverImage,
    brideImage: draft.value.brideImage,
    groomImage: draft.value.groomImage,
    weddingDate: draft.value.weddingDate,
    weddingTz: draft.value.weddingTz,
    events: draft.value.events,
    rsvp: { enabled: draft.value.rsvpEnabled },
    ogImageUrl: draft.value.ogImageUrl,
    studio: { name: 'Vowly', instagram: null, phone: null },
  }
})
const previewWidth = computed(() => ({ desktop: 'w-full', tablet: 'w-[768px] max-w-full', mobile: 'w-[390px] max-w-full' })[device.value])

function addEvent() {
  if (!draft.value) return
  draft.value.events.push({ id: crypto.randomUUID(), invitationId: draft.value.id, title: 'New event', eventDate: draft.value.weddingDate, startTime: null, endTime: null, venue: null, googleMapUrl: null, address: null, notes: null, sortOrder: draft.value.events.length })
}
function removeEvent(index: number) { draft.value?.events.splice(index, 1) }
function moveEvent(index: number, direction: -1 | 1) {
  if (!draft.value) return
  const next = index + direction
  if (next < 0 || next >= draft.value.events.length) return
  const events = draft.value.events
  const current = events[index]!
  events[index] = events[next]!
  events[next] = current
  events.forEach((event, position) => { event.sortOrder = position })
}
async function save() {
  if (!draft.value || draft.value.locked) return
  saving.value = true
  errorMessage.value = null
  try {
    const saved = await api<EditorInvitation>('/client/invitation', { method: 'PUT', body: { brideName: draft.value.brideName, groomName: draft.value.groomName, quote: draft.value.quote, template: draft.value.template, coverImage: draft.value.coverImage, brideImage: draft.value.brideImage, groomImage: draft.value.groomImage, events: draft.value.events } })
    invitation.value = saved
    draft.value = structuredClone(saved)
    notice.value = 'Invitation saved.'
  } catch (error: unknown) { errorMessage.value = error instanceof Error ? error.message : 'Could not save invitation.' } finally { saving.value = false }
}
async function setPublished(published: boolean) {
  if (!draft.value) return
  try {
    const result = await api<{ published: boolean; slug?: string }>('/client/invitation/' + (published ? 'publish' : 'unpublish'), { method: 'POST' })
    draft.value.published = result.published
    if (result.slug) draft.value.slug = result.slug
    notice.value = published ? `Published at /${result.slug}` : 'Invitation unpublished.'
  } catch (error: unknown) { errorMessage.value = error instanceof Error ? error.message : 'Could not change publishing status.' }
}
async function setRsvpEnabled(enabled: boolean) {
  if (!draft.value || draft.value.locked) return
  try {
    await api('/client/invitation/rsvp', { method: 'PATCH', body: { enabled } })
    draft.value.rsvpEnabled = enabled
    notice.value = enabled ? 'RSVP is now open.' : 'RSVP is now closed.'
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not update RSVP settings.'
  }
}
async function logout() { await api('/auth/client/logout', { method: 'POST' }); await navigateTo('/login') }
</script>

<template>
  <div class="min-h-screen bg-[#f3efe6] text-ink-900">
    <header class="bg-ink-900 px-5 py-6 text-ivory-50 sm:px-10">
      <div class="mx-auto flex max-w-[1500px] items-center justify-between">
        <div><p class="text-[10px] uppercase tracking-[0.3em] text-gold-400">Vowly / Invitation studio</p><h1 class="mt-2 font-display text-4xl sm:text-5xl">Make it yours.</h1></div>
        <button class="text-xs uppercase tracking-widest text-ivory-200 hover:text-gold-400" @click="logout">Log out</button>
      </div>
    </header>
    <main v-if="draft" class="mx-auto grid max-w-[1500px] gap-8 px-5 py-8 sm:px-10 lg:grid-cols-[minmax(360px,460px)_1fr]">
      <section>
        <div v-if="draft.locked" class="mb-5 border-l-2 border-gold-500 bg-white px-4 py-4 text-sm"><strong>This invitation is locked.</strong><p class="mt-1 text-ink-700">Editing ended after the wedding day.</p></div>
        <p v-if="notice" class="mb-5 bg-gold-100 px-4 py-3 text-sm">{{ notice }}</p><p v-if="errorMessage" class="mb-5 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>
        <div class="space-y-5">
          <div class="grid grid-cols-2 gap-3"><label class="text-sm">Bride name<input v-model="draft.brideName" :disabled="draft.locked" class="editor-input"></label><label class="text-sm">Groom name<input v-model="draft.groomName" :disabled="draft.locked" class="editor-input"></label></div>
          <label class="block text-sm">Quote<textarea v-model="draft.quote" :disabled="draft.locked" maxlength="300" rows="3" class="editor-input"/></label>
          <div><p class="text-sm">Template</p><div class="mt-2 grid grid-cols-2 gap-3"><button v-for="template in templateDefinitions" :key="template.id" :class="draft.template === template.id ? 'border-gold-500 bg-white' : 'border-ink-900/15 bg-transparent'" class="border p-4 text-left" :disabled="draft.locked" @click="draft.template = template.id"><span class="font-display text-xl">{{ template.name }}</span><span class="mt-1 block text-xs text-ink-700/70">{{ template.description }}</span></button></div></div>
          <div><p class="text-sm">Images</p><p class="mt-2 border border-dashed border-ink-900/20 bg-white p-3 text-center text-xs text-ink-700/70">Image uploads are paused. Add them back after enabling R2 storage.</p></div>
           <div><div class="flex items-center justify-between"><p class="text-sm">Events</p><button class="text-xs uppercase tracking-widest text-gold-600" :disabled="draft.locked" @click="addEvent">+ Add event</button></div><div v-for="(event, index) in draft.events" :key="event.id || index" class="mt-3 border border-ink-900/10 bg-white p-4"><div class="flex gap-2"><input v-model="event.title" :disabled="draft.locked" placeholder="Event title" class="editor-input flex-1"><button :disabled="draft.locked" class="text-xs" @click="removeEvent(index)">Remove</button></div><div class="mt-3 grid grid-cols-2 gap-2"><input v-model="event.eventDate" type="date" :disabled="draft.locked" class="editor-input"><input v-model="event.venue" :disabled="draft.locked" placeholder="Venue" class="editor-input"><input v-model="event.startTime" type="time" :disabled="draft.locked" class="editor-input"><input v-model="event.endTime" type="time" :disabled="draft.locked" class="editor-input"><input v-model="event.googleMapUrl" :disabled="draft.locked" placeholder="Google Maps URL" class="editor-input col-span-2"><input v-model="event.address" :disabled="draft.locked" placeholder="Address" class="editor-input col-span-2"><textarea v-model="event.notes" :disabled="draft.locked" placeholder="Notes" class="editor-input col-span-2"/></div><div class="mt-3 flex gap-3 text-xs"><button :disabled="index === 0 || draft.locked" @click="moveEvent(index, -1)">Move up</button><button :disabled="index === draft.events.length - 1 || draft.locked" @click="moveEvent(index, 1)">Move down</button></div></div></div>
           <div class="border border-ink-900/10 bg-white p-4"><div class="flex items-center justify-between"><div><p class="text-sm font-medium">RSVPs</p><p class="mt-1 text-xs text-ink-700/70">{{ draft.rsvpEnabled ? 'Guests can respond from the invitation.' : 'RSVP form is hidden.' }}</p></div><button class="border border-gold-600 px-3 py-2 text-xs uppercase tracking-widest text-gold-700" :disabled="draft.locked" @click="setRsvpEnabled(!draft.rsvpEnabled)">{{ draft.rsvpEnabled ? 'Disable' : 'Enable' }}</button></div><div v-if="rsvpLoading" class="mt-4 text-xs text-ink-700/60">Loading responses...</div><div v-else-if="rsvps" class="mt-4 grid grid-cols-4 gap-2 text-center text-xs"><div><strong class="block text-xl">{{ rsvps.summary.total }}</strong>responses</div><div><strong class="block text-xl">{{ rsvps.summary.yes }}</strong>yes</div><div><strong class="block text-xl">{{ rsvps.summary.maybe }}</strong>maybe</div><div><strong class="block text-xl">{{ rsvps.summary.guests }}</strong>guests</div></div><p v-if="rsvps && !rsvps.items.length" class="mt-4 text-xs text-ink-700/60">No responses yet.</p><ul v-else-if="rsvps" class="mt-4 divide-y divide-ink-900/10 text-sm"><li v-for="item in rsvps.items" :key="item.id" class="flex justify-between py-2"><span>{{ item.guestName }} <small class="text-ink-700/60">({{ item.guestCount }})</small></span><span class="capitalize text-gold-700">{{ item.status }}</span></li></ul></div>
        </div>
         <div class="mt-7 grid gap-3 sm:grid-cols-2"><button class="bg-ink-900 py-4 text-xs uppercase tracking-[0.2em] text-white hover:bg-gold-600 disabled:opacity-40" :disabled="saving || draft.locked" @click="save">{{ saving ? 'Saving...' : 'Save invitation' }}</button><button class="border border-gold-600 py-4 text-xs uppercase tracking-[0.2em] text-gold-700 disabled:opacity-40" :disabled="draft.locked" @click="setPublished(!draft.published)">{{ draft.published ? 'Unpublish' : 'Publish invitation' }}</button></div>
         <p v-if="draft.published && draft.slug" class="mt-3 text-center text-xs text-ink-700">Public link: <a :href="`/${draft.slug}`" target="_blank" class="text-gold-700 underline">/{{ draft.slug }}</a></p>
      </section>
      <section class="min-w-0"><div class="sticky top-5"><div class="mb-4 flex items-center justify-between"><p class="text-[10px] uppercase tracking-[0.24em] text-gold-600">Live preview</p><div class="flex border border-ink-900/15 bg-white text-xs"><button v-for="option in (['desktop', 'tablet', 'mobile'] as const)" :key="option" :class="device === option ? 'bg-ink-900 text-white' : ''" class="px-3 py-2 capitalize" @click="device = option">{{ option }}</button></div></div><div class="flex justify-center overflow-auto border border-ink-900/10 bg-[#d9d4ca] p-3 sm:p-6"><div v-if="preview" :class="previewWidth" class="overflow-hidden bg-white shadow-2xl transition-all"><TemplateRenderer :invitation="preview" /></div></div></div></section>
    </main>
    <div v-else-if="noInvitation" class="mx-auto max-w-md px-5 py-16 text-center">
      <p class="text-xs uppercase tracking-[0.3em] text-gold-600">Vowly</p>
      <h1 class="mt-3 font-display text-3xl">Your invitation is being prepared</h1>
      <p class="mt-4 text-sm text-ink-700">Your wedding invitation hasn't been created yet. Please contact your wedding planner or check back soon.</p>
      <button class="mt-6 rounded-full bg-ink-900 px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-gold-600" @click="logout">Log out</button>
    </div>
    <div v-else-if="loading" class="p-16 text-center text-sm">Loading studio...</div>
  </div>
</template>

<style scoped>
.editor-input { margin-top: .25rem; width: 100%; border: 1px solid rgb(23 22 18 / 15%); background: white; padding: .5rem .75rem; font-size: .875rem; outline: none }
.editor-input:focus { border-color: #b08d57 }
.editor-input:disabled { background: rgb(23 22 18 / 5%); color: rgb(23 22 18 / 60%) }
</style>
