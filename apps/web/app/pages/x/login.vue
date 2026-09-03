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
    await api('/auth/admin/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    await navigateTo('/x/dashboard')
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
      <p class="text-center text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Vowly Admin</p>
      <h1 class="mt-3 text-center text-2xl font-bold tracking-tight text-slate-950">Admin Login</h1>
      <p class="mt-2 text-center text-sm text-slate-500">
        Manage client invitations and wedding projects.
      </p>
      <form class="mt-8 space-y-4" @submit.prevent="onSubmit">
        <div>
          <label class="block text-sm font-medium text-slate-700">Username</label>
          <input
            v-model="username"
            type="text"
            required
            autocomplete="username"
            class="saas-input mt-1"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
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
      <NuxtLink to="/login" class="mt-6 block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >Client login</NuxtLink
      >
    </div>
  </div>
</template>
