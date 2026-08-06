<script setup lang="ts">
useSeoMeta({
  title: 'Admin Dashboard',
  robots: 'noindex, nofollow',
})

interface AdminSession {
  id: string
  username: string
}

const api = useApi()
const session = ref<AdminSession | null>(null)

try {
  session.value = await api<AdminSession>('/auth/admin/me')
} catch {
  await navigateTo('/x/login')
}

async function logout() {
  await api('/auth/admin/logout', { method: 'POST' })
  await navigateTo('/x/login')
}
</script>

<template>
  <div v-if="session" class="min-h-screen bg-ivory-50 px-6 py-10">
    <div class="mx-auto max-w-5xl">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-gold-600">Vowly Admin</p>
          <h1 class="mt-2 font-display text-4xl">Dashboard</h1>
        </div>
        <button class="text-sm text-ink-700 hover:text-gold-600" @click="logout">Log out</button>
      </div>
      <div class="mt-10 rounded-2xl bg-white p-8 shadow-sm">
        <p class="text-ink-700">Signed in as {{ session.username }}.</p>
        <p class="mt-2 text-sm text-ink-700">Client management will be added in the next milestone.</p>
      </div>
    </div>
  </div>
</template>
