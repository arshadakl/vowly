<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'

useSeoMeta({
  title: 'Invitation Preview',
  robots: 'noindex, nofollow',
})

const route = useRoute()
const api = useApi()
const clientId = route.params.clientId as string
const loading = ref(true)
const errorMessage = ref<string | null>(null)
const templateRequired = ref(false)
const invitation = ref<PublicInvitation | null>(null)

try {
  invitation.value = await api<PublicInvitation>(`/admin/clients/${clientId}/invitation`)
} catch (error: unknown) {
  const apiError = error as { statusCode?: number; message?: string }
  templateRequired.value = apiError.statusCode === 409
  errorMessage.value = templateRequired.value
    ? 'Template selection required. The client must choose a design before previewing.'
    : (apiError.message ?? 'Could not load invitation.')
} finally {
  loading.value = false
}

async function back() {
  await navigateTo('/x/dashboard')
}
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between bg-ink-900 px-5 py-3 text-xs text-ivory-200 sm:px-10"
    >
      <p v-if="invitation" class="uppercase tracking-[0.24em] text-gold-400">
        Preview — {{ invitation.brideName }} &amp; {{ invitation.groomName }}
      </p>
      <p v-else class="uppercase tracking-[0.24em] text-gold-400">Preview</p>
      <button
        class="border border-white/30 px-4 py-2 hover:bg-white hover:text-ink-900"
        @click="back"
      >
        Back to dashboard
      </button>
    </div>
    <div v-if="loading" class="p-16 text-center text-sm text-ink-700/60">Loading preview...</div>
    <div v-else-if="errorMessage" class="p-16 text-center">
      <p class="text-sm" :class="templateRequired ? 'text-amber-700' : 'text-red-700'">
        {{ errorMessage }}
      </p>
    </div>
    <div v-else-if="invitation" class="mx-auto max-w-[430px] shadow-2xl">
      <TemplateRenderer :invitation="invitation" />
    </div>
  </div>
</template>
