<script setup lang="ts">
import type { Client, ClientStatus } from '@vowly/types'

useSeoMeta({
  title: 'Admin Dashboard',
  robots: 'noindex, nofollow',
})

interface AdminSession {
  id: string
  username: string
}

interface ClientStats {
  total: number
  active: number
  readOnly: number
  archived: number
  deleted: number
}

interface ClientPage {
  items: Client[]
  total: number
  page: number
  pageSize: number
  stats: ClientStats
}
interface AdminRsvpData { summary: { total: number; yes: number; no: number; maybe: number; guests: number }; items: Array<{ id: string; guestName: string; status: string; guestCount: number }> }

const api = useApi()
const session = ref<AdminSession | null>(null)
const clients = ref<ClientPage | null>(null)
const search = ref('')
const status = ref<ClientStatus | 'ALL'>('ACTIVE')
const page = ref(1)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref<string | null>(null)
const notice = ref<string | null>(null)
const showCreate = ref(false)
const editing = ref<Client | null>(null)
const form = reactive({ name: '', phone: '', weddingDate: '' })
const selectedRsvps = ref<{ client: Client; data: AdminRsvpData } | null>(null)
const openMenu = ref<string | null>(null)

function toggleMenu(clientId: string) {
  openMenu.value = openMenu.value === clientId ? null : clientId
}

try {
  session.value = await api<AdminSession>('/auth/admin/me')
  await loadClients()
} catch {
  await navigateTo('/x/login')
} finally {
  loading.value = false
}

const pageCount = computed(() => Math.max(1, Math.ceil((clients.value?.total ?? 0) / 20)))

async function loadClients() {
  errorMessage.value = null
  clients.value = await api<ClientPage>('/admin/clients', {
    query: { search: search.value, status: status.value, page: page.value, pageSize: 20 },
  })
}

async function refresh() {
  page.value = 1
  await loadClients()
}

async function runAction(client: Client, action: 'archive' | 'delete' | 'passcode') {
  const labels = { archive: 'archive', delete: 'delete', passcode: 'regenerate this passcode' }
  if (!window.confirm(`Are you sure you want to ${labels[action]} for ${client.name}?`)) return
  try {
    const endpoint = action === 'archive' ? `/admin/clients/${client.id}/archive` : action === 'delete' ? `/admin/clients/${client.id}` : `/admin/clients/${client.id}/passcode`
    const options = action === 'delete' ? { method: 'DELETE' as const } : { method: 'POST' as const }
    const updated = await api<Client>(endpoint, options)
    if (action === 'passcode') {
      await navigator.clipboard?.writeText(updated.passcode)
      notice.value = `New passcode ${updated.passcode} copied to clipboard.`
    } else {
      notice.value = `${client.name} is now ${updated.status.toLowerCase()}.`
    }
    await loadClients()
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Action failed'
  }
}

async function copyShareLink(client: Client) {
  const url = `${window.location.origin}/login?key=${client.passcode}`
  try {
    await navigator.clipboard?.writeText(url)
    notice.value = `Share link copied: ${url}`
  } catch {
    errorMessage.value = 'Could not copy the link.'
  }
}

function startCreate() {
  editing.value = null
  Object.assign(form, { name: '', phone: '', weddingDate: '' })
  showCreate.value = true
}

function startEdit(client: Client) {
  editing.value = client
  Object.assign(form, { name: client.name, phone: client.phone, weddingDate: client.weddingDate })
  showCreate.value = true
}

async function saveClient() {
  saving.value = true
  errorMessage.value = null
  try {
    if (editing.value) {
      await api<Client>(`/admin/clients/${editing.value.id}`, { method: 'PATCH', body: form })
      notice.value = 'Client details updated.'
    } else {
      const created = await api<Client>('/admin/clients', { method: 'POST', body: form })
      const url = `${window.location.origin}/login?key=${created.passcode}`
      notice.value = `${created.clientCode} created. Share link: ${url}`
      await navigator.clipboard?.writeText(url)
    }
    showCreate.value = false
    await loadClients()
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not save client'
  } finally {
    saving.value = false
  }
}

async function logout() {
  await api('/auth/admin/logout', { method: 'POST' })
  await navigateTo('/x/login')
}
async function setOverride(client: Client, override: 'force_open' | 'force_locked' | null) {
  try {
    await api(`/admin/clients/${client.id}/invitation/override`, { method: 'POST', body: { override } })
    notice.value = `${client.name} edit lock updated.`
  } catch (error: unknown) { errorMessage.value = error instanceof Error ? error.message : 'Could not update edit lock.' }
}
async function showRsvps(client: Client) {
  try {
    const data = await api<AdminRsvpData>(`/admin/clients/${client.id}/invitation/rsvps`)
    selectedRsvps.value = { client, data }
  } catch (error: unknown) { errorMessage.value = error instanceof Error ? error.message : 'Could not load RSVPs.' }
}
</script>

<template>
  <div v-if="session" class="min-h-screen bg-[#f3efe6]">
    <header class="border-b border-ink-900/10 bg-[#171612] text-[#f8f3e8]">
      <div class="mx-auto flex max-w-7xl items-end justify-between px-5 py-7 sm:px-10">
        <div>
          <p class="font-sans text-[10px] uppercase tracking-[0.32em] text-gold-400">Vowly / Control room</p>
          <h1 class="mt-3 font-display text-5xl leading-none sm:text-6xl">The guest list.</h1>
          <p class="mt-3 max-w-md text-sm text-[#c5bfae]">A quiet place to keep every wedding project moving.</p>
        </div>
        <button class="mb-1 text-xs uppercase tracking-[0.2em] text-[#c5bfae] transition hover:text-white" @click="logout">Log out</button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-5 py-8 sm:px-10 sm:py-12">
      <div v-if="notice" class="mb-6 flex items-center justify-between border-l-2 border-gold-500 bg-white px-4 py-3 text-sm text-ink-700 shadow-sm">
        <span>{{ notice }}</span><button class="text-xs uppercase tracking-widest" @click="notice = null">Close</button>
      </div>
      <p v-if="errorMessage" class="mb-6 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700">{{ errorMessage }}</p>

      <section v-if="clients" class="grid gap-px overflow-hidden border border-ink-900/10 bg-ink-900/10 sm:grid-cols-5">
        <div v-for="card in [{ label: 'All clients', value: clients.stats.total }, { label: 'Active', value: clients.stats.active }, { label: 'Read only', value: clients.stats.readOnly }, { label: 'Archived', value: clients.stats.archived }, { label: 'Deleted', value: clients.stats.deleted }]" :key="card.label" class="bg-[#f9f6ef] p-5 sm:last:col-span-1">
          <p class="text-[10px] uppercase tracking-[0.24em] text-ink-700/60">{{ card.label }}</p>
          <p class="mt-3 font-display text-4xl">{{ card.value }}</p>
        </div>
      </section>

      <section class="mt-10">
        <div class="flex flex-col gap-4 border-b border-ink-900/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.24em] text-gold-600">Client directory</p>
            <h2 class="mt-2 font-display text-4xl">Projects</h2>
          </div>
          <button class="bg-ink-900 px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-gold-600" @click="startCreate">+ New client</button>
        </div>
        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
          <input v-model="search" type="search" placeholder="Search name, code, or phone" class="min-w-0 flex-1 border border-ink-900/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-500" @keyup.enter="refresh">
          <select v-model="status" class="border border-ink-900/15 bg-white px-4 py-3 text-sm outline-none focus:border-gold-500" @change="refresh">
            <option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="READ_ONLY">Read only</option><option value="ARCHIVED">Archived</option><option value="DELETED">Deleted</option>
          </select>
          <button class="border border-ink-900/20 px-5 py-3 text-xs uppercase tracking-widest transition hover:border-gold-500" @click="refresh">Search</button>
        </div>

        <div v-if="loading" class="py-16 text-center text-sm text-ink-700/60">Loading clients...</div>
        <div v-else-if="clients?.items.length" class="mt-5 overflow-x-auto border border-ink-900/10 bg-white">
          <table class="w-full min-w-[820px] text-left text-sm">
            <thead class="border-b border-ink-900/10 bg-[#faf8f3] text-[10px] uppercase tracking-[0.18em] text-ink-700/60"><tr><th class="px-5 py-4">Client</th><th class="px-5 py-4">Wedding date</th><th class="px-5 py-4">Invitation</th><th class="px-5 py-4">Passcode</th><th class="px-5 py-4">Status</th><th class="px-5 py-4 text-right">Actions</th></tr></thead>
             <tbody><tr v-for="client in clients.items" :key="client.id" class="border-b border-ink-900/10 last:border-0"><td class="px-5 py-5"><p class="font-medium">{{ client.name }}</p><p class="mt-1 text-xs text-ink-700/60">{{ client.clientCode }} · {{ client.phone }}</p></td><td class="px-5 py-5 text-ink-700">{{ client.weddingDate }}</td><td class="px-5 py-5"><span class="border border-gold-500/40 px-2 py-1 text-[10px] uppercase tracking-widest text-gold-600">{{ client.invitation?.published ? 'Published' : client.invitation?.created ? 'Created' : 'Not created' }}</span><NuxtLink v-if="client.invitation?.slug" :to="`/${client.invitation.slug}`" target="_blank" class="ml-2 text-gold-600 underline">Open</NuxtLink><NuxtLink v-else-if="client.invitation?.created" :to="`/x/preview/${client.id}`" target="_blank" class="ml-2 text-gold-600 underline">Preview</NuxtLink></td><td class="px-5 py-5 font-mono text-xs tracking-widest">{{ client.passcode }}</td><td class="px-5 py-5"><span class="border border-gold-500/40 px-2 py-1 text-[10px] uppercase tracking-widest text-gold-600">{{ client.status.replace('_', ' ') }}</span></td><td class="px-5 py-5"><div class="flex items-center justify-end gap-3 text-xs text-ink-700"><NuxtLink :to="`/x/preview/${client.id}`" target="_blank" class="hover:text-gold-600">Preview</NuxtLink><button class="hover:text-gold-600" @click="copyShareLink(client)">Share</button><div class="relative"><button class="flex h-8 w-8 items-center justify-center rounded-full border border-ink-900/15 hover:border-gold-500" aria-label="More actions" @click="toggleMenu(client.id)">⋯</button><div v-if="openMenu === client.id" class="absolute right-0 top-10 z-10 w-44 border border-ink-900/10 bg-white py-1 text-left shadow-xl"><button class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="startEdit(client); openMenu = null">Edit</button><button class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="showRsvps(client); openMenu = null">RSVPs</button><button class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="copyShareLink(client); openMenu = null">Share link</button><button class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="runAction(client, 'passcode'); openMenu = null">New code</button><button class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="setOverride(client, 'force_open'); openMenu = null">Unlock edits</button><button class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="setOverride(client, 'force_locked'); openMenu = null">Lock edits</button><button class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="setOverride(client, null); openMenu = null">Auto lock</button><button v-if="client.status === 'ACTIVE'" class="block w-full px-4 py-2 text-left hover:bg-[#faf8f3]" @click="runAction(client, 'archive'); openMenu = null">Archive</button><button v-if="client.status !== 'DELETED'" class="block w-full px-4 py-2 text-left text-red-700 hover:bg-red-50" @click="runAction(client, 'delete'); openMenu = null">Delete</button></div></div></div></td></tr></tbody>
          </table>
        </div>
        <div v-else class="mt-5 border border-dashed border-ink-900/20 bg-white px-6 py-16 text-center"><p class="font-display text-3xl">No clients here yet.</p><p class="mt-2 text-sm text-ink-700/60">Create a client to start a new invitation project.</p></div>
        <div v-if="clients && pageCount > 1" class="mt-5 flex items-center justify-between text-xs uppercase tracking-widest text-ink-700/70"><button :disabled="page === 1" class="disabled:opacity-30" @click="page--; loadClients()">Previous</button><span>Page {{ page }} of {{ pageCount }}</span><button :disabled="page === pageCount" class="disabled:opacity-30" @click="page++; loadClients()">Next</button></div>
     </section>
    </main>

    <div v-if="selectedRsvps" class="fixed inset-0 z-10 flex items-center justify-center bg-ink-900/50 px-5" @click.self="selectedRsvps = null"><section class="max-h-[80vh] w-full max-w-xl overflow-auto bg-[#f9f6ef] p-7 shadow-2xl"><div class="flex items-start justify-between"><div><p class="text-[10px] uppercase tracking-[0.24em] text-gold-600">Guest responses</p><h2 class="mt-2 font-display text-4xl">{{ selectedRsvps.client.name }}</h2></div><button aria-label="Close RSVP responses" class="text-xl" @click="selectedRsvps = null">×</button></div><div class="mt-6 grid grid-cols-4 gap-2 text-center text-xs"><div><strong class="block text-xl">{{ selectedRsvps.data.summary.total }}</strong>responses</div><div><strong class="block text-xl">{{ selectedRsvps.data.summary.yes }}</strong>yes</div><div><strong class="block text-xl">{{ selectedRsvps.data.summary.maybe }}</strong>maybe</div><div><strong class="block text-xl">{{ selectedRsvps.data.summary.guests }}</strong>guests</div></div><p v-if="!selectedRsvps.data.items.length" class="py-12 text-center text-sm text-ink-700/60">No responses yet.</p><ul v-else class="mt-6 divide-y divide-ink-900/10"><li v-for="item in selectedRsvps.data.items" :key="item.id" class="flex justify-between py-3 text-sm"><span>{{ item.guestName }} ({{ item.guestCount }})</span><span class="capitalize text-gold-700">{{ item.status }}</span></li></ul></section></div>

    <div v-if="showCreate" class="fixed inset-0 z-10 flex items-center justify-center bg-ink-900/50 px-5" @click.self="showCreate = false">
      <form class="w-full max-w-lg bg-[#f9f6ef] p-7 shadow-2xl sm:p-10" @submit.prevent="saveClient"><div class="flex items-start justify-between"><div><p class="text-[10px] uppercase tracking-[0.24em] text-gold-600">{{ editing ? 'Update record' : 'New project' }}</p><h2 class="mt-2 font-display text-4xl">{{ editing ? 'Edit client' : 'Add a client' }}</h2></div><button type="button" class="text-xl" aria-label="Close" @click="showCreate = false">×</button></div><div class="mt-8 space-y-4"><label class="block text-sm">Name<input v-model="form.name" required maxlength="80" class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500"></label><label class="block text-sm">Phone<input v-model="form.phone" required type="tel" class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500"></label><label class="block text-sm">Wedding date<input v-model="form.weddingDate" required type="date" class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500"></label></div><button class="mt-8 w-full bg-ink-900 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-gold-600 disabled:opacity-50" :disabled="saving">{{ saving ? 'Saving...' : editing ? 'Save changes' : 'Create client' }}</button></form>
    </div>
  </div>
</template>
