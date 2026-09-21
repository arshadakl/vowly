<script setup lang="ts">
import type { ClientLogin } from '@vowly/types'

useSeoMeta({
  title: 'Client Login',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const api = useApi()
const redirectTarget =
  typeof route.query.redirect === 'string' &&
  route.query.redirect.startsWith('/') &&
  !route.query.redirect.startsWith('//')
    ? route.query.redirect
    : '/client'
const client = reactive<ClientLogin>({
  passcode: '',
  phone: '',
})
const errorMessage = ref<string | null>(null)
const loading = ref(false)
const hasMagicKey = ref(false)

onMounted(() => {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const key = params.get('key')
  if (!key) return
  client.passcode = key.trim().toLowerCase()
  hasMagicKey.value = true
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
})

async function onSubmit() {
  errorMessage.value = null
  loading.value = true

  try {
    client.passcode = client.passcode.trim().toLowerCase()
    await api('/auth/client/login', { method: 'POST', body: client })
    await api('/auth/client/me')
    await navigateTo(redirectTarget)
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-8">
    <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p class="text-center text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Lace &amp; Looms</p>
      <h1 class="mt-3 text-center text-2xl font-bold tracking-tight text-slate-950">Client Login</h1>
      <p class="mt-2 text-center text-sm text-slate-500">Open your wedding invitation workspace.</p>
      <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700">Passcode</label>
          <input
            v-if="!hasMagicKey"
            v-model="client.passcode"
            type="text"
            required
            maxlength="36"
            autocomplete="one-time-code"
            class="saas-input mt-1"
          />
          <input
            v-else
            :value="client.passcode"
            type="text"
            readonly
            class="saas-input mt-1 bg-slate-100 text-slate-700"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Phone number</label>
          <input
            v-model="client.phone"
            type="tel"
            required
            autocomplete="tel"
            placeholder="9876543210"
            class="saas-input mt-1"
          />
        </div>
        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{{ errorMessage }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="saas-button w-full"
        >
          {{ loading ? 'Please wait...' : 'Sign in' }}
        </button>
      </form>
      <NuxtLink to="/x/login" class="mt-6 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >Admin login</NuxtLink
      >
    </div>
  </div>
</template>
