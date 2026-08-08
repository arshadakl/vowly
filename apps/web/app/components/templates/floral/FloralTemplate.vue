<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'

const props = defineProps<{ invitation: PublicInvitation }>()

const featuredEvent = computed(() => {
  if (props.invitation.featuredVenueEventId) {
    const found = props.invitation.events.find((e) => e.id === props.invitation.featuredVenueEventId)
    if (found) return found
  }
  // Fallback: first event that has a venue or address
  return props.invitation.events.find((e) => e.venue || e.address)
})
</script>

<template>
  <article class="min-h-screen bg-[#faf5ef] text-ink-800">
    <FloralHero :invitation="invitation" />

    <section class="bg-white px-6 py-12">
      <CountdownTimer :target="invitation.weddingDate" :time-zone="invitation.weddingTz" />
    </section>

    <FloralTimeline :events="invitation.events" />

    <FloralVenue :event="featuredEvent" />

    <FloralShare v-if="invitation.slug" :slug="invitation.slug" />

    <FloralFooter :studio="invitation.studio" />
  </article>
</template>
