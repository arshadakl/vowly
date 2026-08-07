<script setup lang="ts">
import type { ClientLogin } from '@vowly/types'

useSeoMeta({
  title: 'Client Login',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const api = useApi()
const queryKey = route.query.key
const redirectTarget =
  typeof route.query.redirect === 'string' &&
  route.query.redirect.startsWith('/') &&
  !route.query.redirect.startsWith('//')
    ? route.query.redirect
    : '/client'
const client = reactive<ClientLogin>({
  passcode: typeof queryKey === 'string' ? queryKey.trim().toLowerCase() : '',
  phone: '',
})
const errorMessage = ref<string | null>(null)
const loading = ref(false)
const hasMagicKey = computed(() => typeof queryKey === 'string' && queryKey.length > 0)

async function onSubmit() {
  errorMessage.value = null
  loading.value = true

  try {
    await api('/auth/client/login', { method: 'POST', body: client })
    await navigateTo(redirectTarget)
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
      <p class="text-center text-xs uppercase tracking-[0.25em] text-gold-600">Vowly</p>
      <h1 class="mt-3 text-center font-display text-3xl">Client Login</h1>
      <p class="mt-2 text-center text-sm text-ink-700">Open your wedding invitation workspace.</p>
      <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm text-ink-700">Passcode</label>
          <input v-if="!hasMagicKey" v-model="client.passcode" type="text" required maxlength="6" autocomplete="one-time-code" class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500">
          <p v-else class="mt-1 rounded-lg bg-ivory-100 px-4 py-3 text-ink-700">{{ client.passcode }}</p>
        </div>
        <div>
          <label class="block text-sm text-ink-700">Phone number</label>
          <input v-model="client.phone" type="tel" required autocomplete="tel" placeholder="9876543210" class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500">
        </div>
        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
        <button type="submit" :disabled="loading" class="w-full rounded-full bg-ink-900 py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gold-600 disabled:opacity-50">
          {{ loading ? 'Please wait...' : 'Continue' }}
        </button>
      </form>
      <NuxtLink to="/x/login" class="mt-6 block text-center text-sm text-ink-700 hover:text-gold-600">Admin access</NuxtLink>
    </div>
  </div>
</template>
