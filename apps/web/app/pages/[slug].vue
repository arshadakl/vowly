<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import QRCode from 'qrcode'

const api = useApi()
const route = useRoute()
const slug = route.params.slug as string
const requestUrl = useRequestURL()
const shareUrl = computed(() =>
  invitation.value ? `${requestUrl.origin}/${invitation.value.slug}` : '',
)
const qrCode = ref('')

const { data: invitation, error: _error } = await useAsyncData(`invitation-${slug}`, async () => {
  return await api<PublicInvitation>(`/public/invitations/${slug}`)
})

const event = useRequestEvent()
if (!invitation.value && event && _error.value?.statusCode === 404) {
  setResponseStatus(event, 404)
}

onMounted(async () => {
  if (invitation.value)
    qrCode.value = await QRCode.toDataURL(shareUrl.value, { width: 240, margin: 1 })
})

const pageTitle = computed(() =>
  invitation.value
    ? `${invitation.value.brideName} & ${invitation.value.groomName} — Wedding Invitation`
    : 'Invitation not found',
)

useSeoMeta({
  title: pageTitle,
  description: () =>
    invitation.value
      ? `You are invited to celebrate the wedding of ${invitation.value.brideName} & ${invitation.value.groomName}`
      : 'Invitation not found',
  robots: 'index, follow',
  ogTitle: pageTitle,
  ogDescription: () =>
    invitation.value
      ? `You are invited to celebrate the wedding of ${invitation.value.brideName} & ${invitation.value.groomName}`
      : undefined,
  ogImage: () => invitation.value?.ogImageUrl ?? undefined,
  twitterCard: 'summary_large_image',
  twitterImage: () => invitation.value?.ogImageUrl ?? undefined,
})
</script>

<template>
  <main class="min-h-screen bg-slate-900">
    <div v-if="invitation" class="mx-auto w-full max-w-[430px] bg-ivory-50 shadow-2xl">
      <TemplateRenderer :invitation="invitation" />
    </div>
    <div
      v-else-if="_error"
      class="flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <h1 class="font-display text-4xl">Invitation unavailable</h1>
      <p class="mt-4 text-ink-700">
        We could not load this invitation right now. Please try again later.
      </p>
    </div>
    <div v-else class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 class="font-display text-4xl">Invitation not found</h1>
      <p class="mt-4 text-ink-700">The link you followed may have expired or been removed.</p>
    </div>
  </main>
</template>
