<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'

const api = useApi()
const route = useRoute()
const slug = route.params.slug as string

const { data: invitation, error: _error } = await useAsyncData(
  `invitation-${slug}`,
  async () => {
    try {
      return await api<PublicInvitation>(`/public/invitations/${slug}`)
    } catch {
      return null
    }
  },
)

const event = useRequestEvent()
if (!invitation.value && event) {
  setResponseStatus(event, 404)
}

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
  <main>
    <TemplateRenderer v-if="invitation" :invitation="invitation" />
    <div v-else class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 class="font-display text-4xl">Invitation not found</h1>
      <p class="mt-4 text-ink-700">The link you followed may have expired or been removed.</p>
    </div>
  </main>
</template>
