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
  Share2,
  Pencil,
  Plus,
  Search,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

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
const showCreate = ref(false)
const editing = ref<Client | null>(null)
const form = reactive({ name: '', phone: '', weddingDate: '' })
const selectedRsvps = ref<{ client: Client; data: AdminRsvpData } | null>(null)
const openMenu = ref<string | null>(null)
const showUserMenu = ref(false)
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

// Share link is now triggered directly using copyShareLink

function actionFromMenu(client: Client, action: 'archive' | 'delete' | 'passcode') {
  void runAction(client, action)
  openMenu.value = null
}

function overrideFromMenu(client: Client, override: 'force_open' | 'force_locked' | null) {
  void setOverride(client, override)
  openMenu.value = null
}

function statusLabel(client: Client): string {
  if (client.status === 'ACTIVE') return client.invitation?.published ? 'Published' : 'Draft'
  return client.status.replace('_', ' ')
}

function statusClasses(client: Client): string {
  if (client.status === 'DELETED') return 'bg-red-50 text-red-700 ring-red-200'
  if (client.status === 'ARCHIVED') return 'bg-slate-100 text-slate-600 ring-slate-200'
  if (client.status === 'READ_ONLY') return 'bg-indigo-50 text-indigo-700 ring-indigo-200'
  return client.invitation?.published
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    : 'bg-amber-50 text-amber-700 ring-amber-200'
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
      toast.success(`New passcode ${updated.passcode} copied to clipboard.`)
    } else {
      toast.success(`${client.name} is now ${updated.status.toLowerCase()}.`)
    }
    await loadClients()
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : 'Action failed')
  }
}

async function copyShareLink(client: Client) {
  const url = `${window.location.origin}/login?key=${client.passcode}`
  try {
    await navigator.clipboard?.writeText(url)
    toast.success('Share link copied to clipboard')
  } catch {
    toast.error('Could not copy the link.')
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
  try {
    if (editing.value) {
      await api<Client>(`/admin/clients/${editing.value.id}`, { method: 'PATCH', body: form })
      toast.success('Client details updated.')
    } else {
      const created = await api<Client>('/admin/clients', { method: 'POST', body: form })
      const url = `${window.location.origin}/login?key=${created.passcode}`
      toast.success(`${created.clientCode} created. Share link copied.`)
      await navigator.clipboard?.writeText(url)
    }
    showCreate.value = false
    await loadClients()
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : 'Could not save client')
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
    toast.success(`${client.name} edit lock updated.`)
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : 'Could not update edit lock.')
  }
}
async function showRsvps(client: Client) {
  try {
    const data = await api<AdminRsvpData>(`/admin/clients/${client.id}/invitation/rsvps`)
    selectedRsvps.value = { client, data }
  } catch (error: unknown) {
    toast.error(error instanceof Error ? error.message : 'Could not load RSVPs.')
  }
}
</script>

<template>
  <div v-if="session" class="admin-dashboard min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6">
    <!-- Clickaway overlay for the 3-dot client menus -->
    <div
      v-if="openMenu"
      class="fixed inset-0 z-40"
      @click="openMenu = null"
      @wheel="openMenu = null"
      @touchmove="openMenu = null"
    />

    <header
      class="admin-header mx-auto flex max-w-7xl items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-8"
    >
      <div class="flex items-center gap-4">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Heart class="h-4 w-4" :stroke-width="2.5" />
        </div>
        <div>
          <p class="text-lg font-semibold leading-none tracking-tight">Vowly</p>
          <p class="mt-1 text-sm text-slate-500">Admin workspace</p>
        </div>
      </div>
      <div class="relative">
        <button
          class="flex items-center gap-3 text-sm font-medium hover:opacity-80 focus:outline-none"
          @click="showUserMenu = !showUserMenu"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-700"
            >{{ session.username.charAt(0).toUpperCase() }}</span
          >
          <span class="hidden sm:inline">{{ session.username }}</span>
          <ChevronDown class="h-4 w-4 text-[#596276]" />
        </button>

        <div
          v-if="showUserMenu"
          class="absolute right-0 top-full mt-2 w-48 rounded-lg border border-[#e1e5ed] bg-white py-1 shadow-xl z-50"
        >
          <button
            class="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
            @click="logout"
          >
            Log out
          </button>
        </div>

        <!-- Invisible overlay for clickaway -->
        <div v-if="showUserMenu" class="fixed inset-0 z-40" @click="showUserMenu = false" />
      </div>
    </header>

    <main class="admin-main mx-auto mt-5 max-w-7xl rounded-xl border border-slate-200 bg-white shadow-sm">
      <section class="mt-0">
        <div v-if="clients" class="grid gap-4 border-b border-slate-200 px-6 py-6 sm:grid-cols-2 sm:px-10 xl:grid-cols-4">
          <article class="admin-stat-card">
            <p>Total clients</p>
            <strong>{{ clients.stats.total }}</strong>
            <span>Across all workspaces</span>
          </article>
          <article class="admin-stat-card">
            <p>Active clients</p>
            <strong>{{ clients.stats.active }}</strong>
            <span>Currently available</span>
          </article>
          <article class="admin-stat-card">
            <p>Read only</p>
            <strong>{{ clients.stats.readOnly }}</strong>
            <span>Access restricted</span>
          </article>
          <article class="admin-stat-card">
            <p>Archived</p>
            <strong>{{ clients.stats.archived }}</strong>
            <span>No longer active</span>
          </article>
        </div>
        <div
          class="flex flex-col gap-4 border-b border-[#e8ebf1] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <div>
            <h2 class="text-3xl font-semibold tracking-tight">All Clients</h2>
            <p class="mt-2 text-sm text-[#6b7487]">Manage all your clients and their invitations</p>
          </div>
          <button
            class="saas-button"
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
              class="saas-input pl-11"
              @keyup.enter="refresh"
            />
          </div>
          <select
            v-model="status"
            class="saas-input sm:w-[215px]"
            @change="refresh"
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="READ_ONLY">Read only</option>
            <option value="ARCHIVED">Archived</option>
            <option value="DELETED">Deleted</option>
          </select>
          <button
            class="saas-button-secondary sm:hidden"
            @click="refresh"
          >
            Search
          </button>
        </div>

        <div v-if="loading" class="py-16 text-center text-sm text-ink-700/60">
          Loading clients...
        </div>
        <div v-else-if="clients?.items.length" class="mx-4 sm:mx-10">
          <!-- Desktop Table -->
          <div class="hidden overflow-x-auto rounded-lg border border-[#e1e5ed] bg-white sm:block">
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
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700"
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
                      :class="statusClasses(client)"
                      class="rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset"
                      >{{ statusLabel(client) }}</span
                    >
                  </td>
                  <td class="px-4 py-4">
                    <span
                      class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 ring-1 ring-inset ring-slate-200"
                      >{{ client.invitation?.template ?? 'Template selection required' }}</span
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
                        class="saas-icon-button"
                        aria-label="Share"
                        @click="copyShareLink(client)"
                      >
                        <Share2 class="h-4 w-4" /></button
                      ><button
                        class="saas-icon-button"
                        aria-label="Preview"
                        @click="navigateTo(`/x/preview/${client.id}`)"
                      >
                        <Eye class="h-4 w-4" /></button
                      ><button
                        class="saas-icon-button"
                        aria-label="Edit"
                        @click="startEdit(client)"
                      >
                        <Pencil class="h-4 w-4" /></button
                      ><button
                        class="saas-icon-button"
                        aria-label="More actions"
                        @click="toggleMenu(client.id, $event)"
                      >
                        <MoreVertical class="h-4 w-4" />
                      </button>
                      <div
                        v-if="openMenu === client.id"
                        class="fixed z-50 w-44 rounded-lg border border-[#e1e5ed] bg-white py-1 text-left shadow-xl"
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

          <!-- Mobile Cards -->
          <div class="space-y-4 sm:hidden">
            <div
              v-for="client in clients.items"
              :key="client.id + '-mobile'"
              class="rounded-xl border border-[#e1e5ed] bg-white p-4 shadow-sm"
            >
              <div class="flex items-center justify-between border-b border-[#edf0f4] pb-3">
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-700"
                    >{{ client.name.charAt(0).toUpperCase() }}</span
                  >
                  <div>
                    <p class="font-semibold text-base">{{ client.name }}</p>
                    <p class="text-xs text-[#596276] mt-0.5">
                      <CalendarDays class="mr-1 inline h-3 w-3" />{{ client.weddingDate }}
                    </p>
                  </div>
                </div>
                <span
                  :class="statusClasses(client)"
                  class="rounded-full px-2 py-1 text-[10px] font-semibold capitalize ring-1 ring-inset"
                  >{{ statusLabel(client) }}</span
                >
              </div>

              <div class="py-3 flex justify-between text-sm">
                <div>
                  <p class="text-[#596276] text-xs">Phone Number</p>
                  <p class="font-medium mt-0.5">{{ client.phone }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[#596276] text-xs">Template</p>
                  <p class="mt-0.5 font-medium capitalize text-slate-700">
                    {{ client.invitation?.template ?? 'Template selection required' }}
                  </p>
                </div>
              </div>

              <div class="flex justify-between items-center pt-3 border-t border-[#edf0f4]">
                <button
                  class="inline-flex items-center gap-2 text-sm text-[#4e586d] font-medium py-1 px-2 -ml-2 rounded-lg hover:bg-[#f8f9fb] transition"
                  @click="copyShareLink(client)"
                >
                  <Share2 class="h-4 w-4" /> Share
                </button>
                <div class="flex gap-2 relative">
                  <button
                    class="saas-icon-button"
                    @click="navigateTo(`/x/preview/${client.id}`)"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                  <button
                    class="saas-icon-button"
                    @click="startEdit(client)"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    class="saas-icon-button"
                    @click="toggleMenu(client.id, $event)"
                  >
                    <MoreVertical class="h-4 w-4" />
                  </button>
                  <div
                    v-if="openMenu === client.id"
                    class="fixed z-50 w-44 rounded-lg border border-[#e1e5ed] bg-white py-1 text-left shadow-xl"
                    :style="{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }"
                  >
                    <button
                      class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                      @click="editFromMenu(client)"
                    >
                      Edit
                    </button>
                    <button
                      class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                      @click="showRsvpsFromMenu(client)"
                    >
                      RSVPs
                    </button>
                    <button
                      class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                      @click="actionFromMenu(client, 'passcode')"
                    >
                      New code
                    </button>
                    <button
                      class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                      @click="overrideFromMenu(client, 'force_open')"
                    >
                      Unlock edits
                    </button>
                    <button
                      class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                      @click="overrideFromMenu(client, 'force_locked')"
                    >
                      Lock edits
                    </button>
                    <button
                      class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                      @click="overrideFromMenu(client, null)"
                    >
                      Auto lock
                    </button>
                    <button
                      v-if="client.status === 'ACTIVE'"
                      class="block w-full px-4 py-2 text-left text-xs hover:bg-[#f8f9fb]"
                      @click="actionFromMenu(client, 'archive')"
                    >
                      Archive
                    </button>
                    <button
                      v-if="client.status !== 'DELETED'"
                      class="block w-full px-4 py-2 text-left text-xs text-red-700 hover:bg-red-50"
                      @click="actionFromMenu(client, 'delete')"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="mt-5 border border-dashed border-ink-900/20 bg-white px-6 py-16 text-center"
        >
          <p class="text-xl font-bold tracking-tight text-slate-950">No clients here yet.</p>
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
      @click.self="selectedRsvps = null"
    >
      <section class="max-h-[85vh] w-full max-w-xl overflow-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Guest responses</p>
            <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">{{ selectedRsvps.client.name }}</h2>
          </div>
          <button aria-label="Close RSVP responses" class="saas-icon-button" @click="selectedRsvps = null">
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
            ><span class="font-medium capitalize text-indigo-700">{{ item.status }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div
      v-if="showCreate"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
      @click.self="showCreate = false"
    >
      <form
        class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8"
        @submit.prevent="saveClient"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              {{ editing ? 'Update record' : 'New project' }}
            </p>
            <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">
              {{ editing ? 'Edit client' : 'Add a client' }}
            </h2>
          </div>
          <button type="button" class="saas-icon-button" aria-label="Close" @click="showCreate = false">
            ×
          </button>
        </div>
        <div class="mt-8 space-y-4">
          <label class="block text-sm"
            >Name<input
              v-model="form.name"
              required
              maxlength="80"
              class="saas-input mt-1" /></label
          ><label class="block text-sm"
            >Phone<input
              v-model="form.phone"
              required
              type="tel"
              class="saas-input mt-1" /></label
          ><label class="block text-sm"
            >Wedding date<input
              v-model="form.weddingDate"
              required
              type="date"
              class="saas-input mt-1"
          /></label>
        </div>
        <button
          class="saas-button mt-8 w-full"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : editing ? 'Save changes' : 'Create client' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style>
.admin-dashboard {
  font-family: var(--font-sans);
}

.admin-dashboard .admin-header,
.admin-dashboard .admin-main {
  border-color: #e2e8f0;
}

.admin-dashboard .admin-header {
  box-shadow: 0 1px 3px rgb(15 23 42 / 4%);
}

.admin-dashboard .admin-main {
  overflow: hidden;
}

.admin-dashboard .admin-stat-card {
  min-height: 8.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #fff;
  padding: 1.25rem;
}

.admin-dashboard .admin-stat-card p {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-dashboard .admin-stat-card strong {
  display: block;
  margin-top: 0.75rem;
  color: #0f172a;
  font-size: 1.875rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1;
}

.admin-dashboard .admin-stat-card span {
  display: block;
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.75rem;
}

.admin-dashboard .admin-main > section > div:nth-child(2),
.admin-dashboard .admin-main > section > div:nth-child(3) {
  border-color: #e2e8f0;
}

.admin-dashboard .admin-main table {
  color: #334155;
}

.admin-dashboard .admin-main table thead {
  background: #fff;
  color: #64748b;
}

.admin-dashboard .admin-main table tr {
  border-color: #f1f5f9;
}

.admin-dashboard .admin-main table tr:hover {
  background: #f8fafc;
}

.admin-dashboard .admin-main [class*='border-[#e1e5ed]'] {
  border-color: #e2e8f0;
}

.admin-dashboard .admin-main [class*='border-[#edf0f4]'] {
  border-color: #f1f5f9;
}

.admin-dashboard .admin-main [class*='text-[#596276]'],
.admin-dashboard .admin-main [class*='text-[#687287]'],
.admin-dashboard .admin-main [class*='text-[#6b7487]'] {
  color: #64748b;
}

.admin-dashboard .admin-main [class*='bg-[#f8f9fb]'] {
  background: #fff;
}

.admin-dashboard .admin-main [class*='focus:border-[#b9a2d9]']:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgb(129 140 248 / 18%);
}

@media (max-width: 639px) {
  .admin-dashboard {
    padding-inline: 0.75rem;
  }

  .admin-dashboard .admin-header {
    padding-inline: 1rem;
  }

  .admin-dashboard .admin-main {
    margin-top: 1rem;
    border-radius: 0.75rem;
  }
}
</style>
