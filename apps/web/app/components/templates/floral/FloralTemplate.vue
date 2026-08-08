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
  <article class="@container min-h-screen bg-[#faf5ef] text-ink-800">
    <FloralHero :invitation="invitation" />

    <section class="relative z-20 -mt-8 px-6 pb-12 sm:-mt-12">
      <FloralCountdown :target="invitation.weddingDate" :time-zone="invitation.weddingTz" />
    </section>

    <FloralTimeline :events="invitation.events" />

    <FloralVenue :event="featuredEvent" />

    <FloralShare v-if="invitation.slug" :slug="invitation.slug" :invitation="invitation" />

    <FloralFooter :studio="invitation.studio" />
  </article>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

.font-playfair {
  font-family: 'Playfair Display', serif;
}
</style>
