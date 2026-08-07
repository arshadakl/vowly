<script setup lang="ts">
useSeoMeta({
  title: 'Admin Login',
  robots: 'noindex, nofollow',
})

const api = useApi()
const username = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const loading = ref(false)

async function onSubmit() {
  errorMessage.value = null
  loading.value = true

  try {
    await api('/auth/admin/login', { method: 'POST', body: { username: username.value, password: password.value } })
    await navigateTo('/x/dashboard')
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-ivory-50 px-6">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <p class="text-center text-xs uppercase tracking-[0.25em] text-gold-600">Vowly Admin</p>
      <h1 class="mt-3 text-center font-display text-3xl">Admin Login</h1>
      <p class="mt-2 text-center text-sm text-ink-700">Manage client invitations and wedding projects.</p>
      <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm text-ink-700">Username</label>
          <input v-model="username" type="text" required autocomplete="username" class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500">
        </div>
        <div>
          <label class="block text-sm text-ink-700">Password</label>
          <input v-model="password" type="password" required autocomplete="current-password" class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500">
        </div>
        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
        <button type="submit" :disabled="loading" class="w-full rounded-full bg-ink-900 py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gold-600 disabled:opacity-50">
          {{ loading ? 'Please wait...' : 'Sign in' }}
        </button>
      </form>
      <NuxtLink to="/login" class="mt-6 block text-center text-sm text-ink-700 hover:text-gold-600">Client login</NuxtLink>
    </div>
  </div>
</template>
