<script setup lang="ts">
import type { Client, ClientStatus } from '@vowly/types'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  MoreVertical,
  Pencil,
  Plus,
  Search,
} from 'lucide-vue-next'

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
interface AdminRsvpData {
  summary: { total: number; yes: number; no: number; maybe: number; guests: number }
  items: Array<{ id: string; guestName: string; status: string; guestCount: number }>
}

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
const menuPosition = reactive({ top: 0, left: 0 })

function toggleMenu(clientId: string, event: MouseEvent) {
  openMenu.value = openMenu.value === clientId ? null : clientId
  if (openMenu.value) {
    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    menuPosition.top = rect.bottom + 8
    menuPosition.left = Math.max(8, rect.right - 176)
  }
}

function editFromMenu(client: Client) {
  startEdit(client)
  openMenu.value = null
}

function showRsvpsFromMenu(client: Client) {
  void showRsvps(client)
  openMenu.value = null
}

function shareFromMenu(client: Client) {
  void copyShareLink(client)
  openMenu.value = null
}

function actionFromMenu(client: Client, action: 'archive' | 'delete' | 'passcode') {
  void runAction(client, action)
  openMenu.value = null
}

function overrideFromMenu(client: Client, override: 'force_open' | 'force_locked' | null) {
  void setOverride(client, override)
  openMenu.value = null
}

function changePage(direction: -1 | 1) {
  page.value += direction
  void loadClients()
}

try {
  session.value = await api<AdminSession>('/auth/admin/me')
  await loadClients()
} catch {
  await navigateTo('/x/login')
} finally {
  loading.value = false
}

const pageCount = computed(() =>
  Math.max(1, Math.ceil((clients.value?.total ?? 0) / (clients.value?.pageSize ?? 20))),
)

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
    const endpoint =
      action === 'archive'
        ? `/admin/clients/${client.id}/archive`
        : action === 'delete'
          ? `/admin/clients/${client.id}`
          : `/admin/clients/${client.id}/passcode`
    const options =
      action === 'delete' ? { method: 'DELETE' as const } : { method: 'POST' as const }
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
    await api(`/admin/clients/${client.id}/invitation/override`, {
      method: 'POST',
      body: { override },
    })
    notice.value = `${client.name} edit lock updated.`
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not update edit lock.'
  }
}
async function showRsvps(client: Client) {
  try {
    const data = await api<AdminRsvpData>(`/admin/clients/${client.id}/invitation/rsvps`)
    selectedRsvps.value = { client, data }
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Could not load RSVPs.'
  }
}
</script>

<template>
  <div v-if="session" class="min-h-screen bg-[#f4f6fa] px-4 py-5 text-[#172033] sm:px-6">
    <header
      class="mx-auto flex max-w-[1500px] items-center justify-between rounded-xl border border-[#e8ebf1] bg-white px-6 py-4 shadow-[0_8px_30px_rgb(23_32_51/5%)] sm:px-8"
    >
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center text-[#d4ad63]">
          <Heart class="h-10 w-10" :stroke-width="1.5" />
        </div>
        <div>
          <p class="text-lg font-semibold leading-none">Invitation Manager</p>
          <p class="mt-1 text-sm text-[#6b7487]">Wedding Invitation Platform</p>
        </div>
      </div>
      <div class="flex items-center gap-3 text-sm font-medium">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0eef8] text-[#34294d]"
          >{{ session.username.charAt(0).toUpperCase() }}</span
        ><span class="hidden sm:inline">{{ session.username }}</span
        ><button class="text-[#596276]" aria-label="Log out" @click="logout">
          <ChevronDown class="h-4 w-4" />
        </button>
      </div>
    </header>

    <main
      class="mx-auto mt-5 max-w-[1500px] rounded-xl border border-[#e8ebf1] bg-white shadow-[0_8px_30px_rgb(23_32_51/4%)]"
    >
      <div
        v-if="notice"
        class="mb-6 flex items-center justify-between border-l-2 border-gold-500 bg-white px-4 py-3 text-sm text-ink-700 shadow-sm"
      >
        <span>{{ notice }}</span
        ><button class="text-xs uppercase tracking-widest" @click="notice = null">Close</button>
      </div>
      <p
        v-if="errorMessage"
        class="mb-6 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ errorMessage }}
      </p>

      <section class="mt-0">
        <div
          class="flex flex-col gap-4 border-b border-[#e8ebf1] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <div>
            <h2 class="text-3xl font-semibold tracking-tight">All Clients</h2>
            <p class="mt-2 text-sm text-[#6b7487]">Manage all your clients and their invitations</p>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-lg bg-[#111722] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#273044]"
            @click="startCreate"
          >
            <Plus class="h-5 w-5" /> Add Client
          </button>
        </div>
        <div
          class="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <div class="relative min-w-0 sm:w-[465px]">
            <Search
              class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7487]"
            /><input
              v-model="search"
              type="search"
              placeholder="Search by couple name, phone or slug..."
              class="w-full rounded-lg border border-[#dfe4ed] bg-white py-3 pl-11 pr-4 text-sm text-[#4e586d] outline-none transition focus:border-[#b9a2d9]"
              @keyup.enter="refresh"
            >
          </div>
          <select
            v-model="status"
            class="rounded-lg border border-[#dfe4ed] bg-white px-4 py-3 text-sm text-[#4e586d] outline-none focus:border-[#b9a2d9] sm:w-[215px]"
            @change="refresh"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="READ_ONLY">Read only</option>
            <option value="ARCHIVED">Archived</option>
            <option value="DELETED">Deleted</option>
          </select>
          <button
            class="rounded-lg border border-[#dfe4ed] px-5 py-3 text-xs font-semibold uppercase tracking-widest text-[#4e586d] transition hover:border-[#b9a2d9] sm:hidden"
            @click="refresh"
          >
            Search
          </button>
        </div>

        <div v-if="loading" class="py-16 text-center text-sm text-ink-700/60">
          Loading clients...
        </div>
        <div
          v-else-if="clients?.items.length"
          class="mx-6 overflow-x-auto rounded-lg border border-[#e1e5ed] bg-white sm:mx-10"
        >
          <table class="w-full min-w-[820px] text-left text-sm">
            <thead
              class="border-b border-[#e1e5ed] bg-[#f8f9fb] text-xs font-semibold text-[#596276]"
            >
              <tr>
                <th class="px-4 py-4">#</th>
                <th class="px-4 py-4">Couple Name</th>
                <th class="px-4 py-4">Phone Number</th>
                <th class="px-4 py-4">Wedding Date</th>
                <th class="px-4 py-4">Status</th>
                <th class="px-4 py-4">Template</th>
                <th class="px-4 py-4">Published</th>
                <th class="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="client in clients.items"
                :key="client.id"
                class="border-b border-[#edf0f4] last:border-0 hover:bg-[#fbfcfe]"
              >
                <td class="px-4 py-4 text-sm text-[#596276]">
                  {{ (page - 1) * (clients?.pageSize ?? 20) + clients.items.indexOf(client) + 1 }}
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 items-center justify-center rounded-full bg-[#f8e6ef] text-sm font-semibold text-[#a54167]"
                      >{{ client.name.charAt(0).toUpperCase() }}</span
                    >
                    <p class="font-semibold">{{ client.name }}</p>
                  </div>
                </td>
                <td class="px-4 py-4 text-sm">{{ client.phone }}</td>
                <td class="px-4 py-4 text-sm text-[#3e485b]">
                  <CalendarDays class="mr-2 inline h-4 w-4" />{{ client.weddingDate }}
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="
                      client.status === 'ACTIVE'
                        ? 'bg-[#e4f5e9] text-[#2d7a4b]'
                        : client.status === 'READ_ONLY'
                          ? 'bg-[#eaf0ff] text-[#3461bd]'
                          : 'bg-[#fff0ea] text-[#c4572c]'
                    "
                    class="rounded-lg px-3 py-2 text-xs font-semibold"
                    >{{
                      client.status === 'ACTIVE'
                        ? client.invitation?.published
                          ? 'Published'
                          : 'Draft'
                        : client.status.replace('_', ' ')
                    }}</span
                  >
                </td>
                <td class="px-4 py-4">
                  <span
                    class="rounded-lg bg-[#f5f0e8] px-3 py-2 text-xs font-semibold text-[#8f6e3f]"
                    >Floral</span
                  >
                </td>
                <td class="px-4 py-4 text-sm text-[#3e485b]">
                  {{
                    client.invitation?.publishedAt
                      ? client.invitation.publishedAt.slice(0, 10)
                      : '—'
                  }}
                </td>
                <td class="px-4 py-4">
                  <NuxtLink
                    v-if="client.invitation?.slug"
                    :to="`/${client.invitation.slug}`"
                    target="_blank"
                    class="sr-only"
                    >Open</NuxtLink
                  >
                  <div class="relative flex justify-end gap-2">
                    <button
                      class="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e1e5ed] text-base text-[#4e586d] hover:border-[#b9a2d9]"
                      aria-label="Preview"
                      @click="navigateTo(`/x/preview/${client.id}`)"
                    >
                      ><Eye class="h-4 w-4" /></button
                    ><button
                      class="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e1e5ed] text-base text-[#4e586d] hover:border-[#b9a2d9]"
                      aria-label="Edit"
                      @click="startEdit(client)"
                    >
                      ><Pencil class="h-4 w-4" /></button
                    ><button
                      class="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e1e5ed] text-base text-[#4e586d] hover:border-[#b9a2d9]"
                      aria-label="More actions"
                      @click="toggleMenu(client.id, $event)"
                    >
                      ><MoreVertical class="h-4 w-4" />
                    </button>
                    <div
                      v-if="openMenu === client.id"
                      class="fixed z-50 w-44 border border-[#e1e5ed] bg-white py-1 text-left shadow-xl"
                      :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
                    >
                      <button
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="editFromMenu(client)"
                      >
                        Edit</button
                      ><button
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="showRsvpsFromMenu(client)"
                      >
                        RSVPs</button
                      ><button
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="shareFromMenu(client)"
                      >
                        Share link</button
                      ><button
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="actionFromMenu(client, 'passcode')"
                      >
                        New code</button
                      ><button
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="overrideFromMenu(client, 'force_open')"
                      >
                        Unlock edits</button
                      ><button
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="overrideFromMenu(client, 'force_locked')"
                      >
                        Lock edits</button
                      ><button
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="overrideFromMenu(client, null)"
                      >
                        Auto lock</button
                      ><button
                        v-if="client.status === 'ACTIVE'"
                        class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                        @click="actionFromMenu(client, 'archive')"
                      >
                        Archive</button
                      ><button
                        v-if="client.status !== 'DELETED'"
                        class="block w-full px-4 py-2 text-left text-xs text-red-700 hover:bg-red-50"
                        @click="actionFromMenu(client, 'delete')"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-else
          class="mt-5 border border-dashed border-ink-900/20 bg-white px-6 py-16 text-center"
        >
          <p class="font-display text-3xl">No clients here yet.</p>
          <p class="mt-2 text-sm text-ink-700/60">
            Create a client to start a new invitation project.
          </p>
        </div>
        <div
          v-if="clients"
          class="flex flex-col gap-4 px-6 py-5 text-sm text-[#687287] sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <span
            >Showing {{ clients.items.length ? (page - 1) * clients.pageSize + 1 : 0 }} to
            {{ (page - 1) * clients.pageSize + clients.items.length }} of
            {{ clients.total }} clients</span
          >
          <div v-if="pageCount > 1" class="flex items-center gap-2">
            <button
              :disabled="page === 1"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e5ed] disabled:opacity-30"
              @click="changePage(-1)"
            >
              ><ChevronLeft class="h-4 w-4" /></button
            ><button
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111722] text-white"
            >
              {{ page }}</button
            ><button
              :disabled="page === pageCount"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e1e5ed] disabled:opacity-30"
              @click="changePage(1)"
            >
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </main>

    <div
      v-if="selectedRsvps"
      class="fixed inset-0 z-10 flex items-center justify-center bg-ink-900/50 px-5"
      @click.self="selectedRsvps = null"
    >
      <section class="max-h-[80vh] w-full max-w-xl overflow-auto bg-[#f9f6ef] p-7 shadow-2xl">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.24em] text-gold-600">Guest responses</p>
            <h2 class="mt-2 font-display text-4xl">{{ selectedRsvps.client.name }}</h2>
          </div>
          <button aria-label="Close RSVP responses" class="text-xl" @click="selectedRsvps = null">
            ×
          </button>
        </div>
        <div class="mt-6 grid grid-cols-4 gap-2 text-center text-xs">
          <div>
            <strong class="block text-xl">{{ selectedRsvps.data.summary.total }}</strong
            >responses
          </div>
          <div>
            <strong class="block text-xl">{{ selectedRsvps.data.summary.yes }}</strong
            >yes
          </div>
          <div>
            <strong class="block text-xl">{{ selectedRsvps.data.summary.maybe }}</strong
            >maybe
          </div>
          <div>
            <strong class="block text-xl">{{ selectedRsvps.data.summary.guests }}</strong
            >guests
          </div>
        </div>
        <p
          v-if="!selectedRsvps.data.items.length"
          class="py-12 text-center text-sm text-ink-700/60"
        >
          No responses yet.
        </p>
        <ul v-else class="mt-6 divide-y divide-ink-900/10">
          <li
            v-for="item in selectedRsvps.data.items"
            :key="item.id"
            class="flex justify-between py-3 text-sm"
          >
            <span>{{ item.guestName }} ({{ item.guestCount }})</span
            ><span class="capitalize text-gold-700">{{ item.status }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div
      v-if="showCreate"
      class="fixed inset-0 z-10 flex items-center justify-center bg-ink-900/50 px-5"
      @click.self="showCreate = false"
    >
      <form
        class="w-full max-w-lg bg-[#f9f6ef] p-7 shadow-2xl sm:p-10"
        @submit.prevent="saveClient"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.24em] text-gold-600">
              {{ editing ? 'Update record' : 'New project' }}
            </p>
            <h2 class="mt-2 font-display text-4xl">
              {{ editing ? 'Edit client' : 'Add a client' }}
            </h2>
          </div>
          <button type="button" class="text-xl" aria-label="Close" @click="showCreate = false">
            ×
          </button>
        </div>
        <div class="mt-8 space-y-4">
          <label class="block text-sm"
            >Name<input
              v-model="form.name"
              required
              maxlength="80"
              class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500" ></label
          ><label class="block text-sm"
            >Phone<input
              v-model="form.phone"
              required
              type="tel"
              class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500" ></label
          ><label class="block text-sm"
            >Wedding date<input
              v-model="form.weddingDate"
              required
              type="date"
              class="mt-1 w-full border border-ink-900/15 bg-white px-4 py-3 outline-none focus:border-gold-500"
          ></label>
        </div>
        <button
          class="mt-8 w-full bg-ink-900 py-3 text-xs uppercase tracking-[0.2em] text-white hover:bg-gold-600 disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : editing ? 'Save changes' : 'Create client' }}
        </button>
      </form>
    </div>
  </div>
</template>
