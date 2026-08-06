<script setup lang="ts">
import type { AdminLogin, ClientLogin } from '@vowly/types'

useSeoMeta({
  title: 'Login',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const api = useApi()
const mode = ref<'admin' | 'client'>('client')

const client = reactive<ClientLogin>({
  passcode: (route.query.key as string) ?? '',
  phone: '',
})

const admin = reactive<AdminLogin>({
  username: '',
  password: '',
})

const errorMessage = ref<string | null>(null)
const loading = ref(false)

const hasMagicKey = computed(() => Boolean(route.query.key))

async function onSubmit() {
  errorMessage.value = null
  loading.value = true

  try {
    // Endpoints to be implemented in M1/M2.
    const endpoint = mode.value === 'admin' ? '/auth/admin/login' : '/auth/client/login'
    const payload = mode.value === 'admin' ? admin : client
    await api(endpoint, { method: 'POST', body: payload })

    // TODO: store session token / redirect to dashboard
    await navigateTo(mode.value === 'admin' ? '/admin' : '/client')
  } catch (err: unknown) {
    const message = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Login failed'
    errorMessage.value = message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-ivory-50 px-6">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <h1 class="text-center font-display text-3xl">Welcome to Vowly</h1>

      <div class="mt-6 flex rounded-full bg-ivory-100 p-1">
        <button
          type="button"
          :class="[
            'flex-1 rounded-full py-2 text-sm font-medium transition-colors',
            mode === 'client' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700',
          ]"
          @click="mode = 'client'"
        >
          Client
        </button>
        <button
          type="button"
          :class="[
            'flex-1 rounded-full py-2 text-sm font-medium transition-colors',
            mode === 'admin' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-700',
          ]"
          @click="mode = 'admin'"
        >
          Admin
        </button>
      </div>

      <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
        <template v-if="mode === 'client'">
          <div>
            <label class="block text-sm text-ink-700">Passcode</label>
            <input
              v-if="!hasMagicKey"
              v-model="client.passcode"
              type="text"
              maxlength="6"
              class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500"
            >
            <p v-else class="mt-1 rounded-lg bg-ivory-100 px-4 py-3 text-ink-700">
              {{ client.passcode }}
            </p>
          </div>
          <div>
            <label class="block text-sm text-ink-700">Phone number</label>
            <input
              v-model="client.phone"
              type="tel"
              class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500"
              placeholder="9876543210"
            >
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-sm text-ink-700">Username</label>
            <input
              v-model="admin.username"
              type="text"
              class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500"
            >
          </div>
          <div>
            <label class="block text-sm text-ink-700">Password</label>
            <input
              v-model="admin.password"
              type="password"
              class="mt-1 w-full rounded-lg border border-ink-800/20 bg-white px-4 py-3 outline-none focus:border-gold-500"
            >
          </div>
        </template>

        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-full bg-ink-900 py-3 text-sm font-medium uppercase tracking-widest text-white hover:bg-gold-600 disabled:opacity-50 transition-colors"
        >
          {{ loading ? 'Please wait...' : 'Continue' }}
        </button>
      </form>
    </div>
  </div>
</template>
