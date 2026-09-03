<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl } from '@vowly/utils'
import { Calendar, MapPin, Clock, Sparkles, Heart, ExternalLink } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('romantic-blush')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Rizwan')
const brideName = computed(() => inv.value.brideName || 'Ayesha')
const groomParents = computed(() => inv.value.groomParents || 'Son of Mr. & Mrs. Rahman')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Mr. & Mrs. Ibrahim')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-25')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroTagline = computed(() => inv.value.customization.text.heroTagline || 'Together with their families')
const heroEventText = computed(() => inv.value.customization.text.heroEventText || 'invite you to celebrate their wedding')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting Down To The Big Day')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'Grand Palace Hall')
const venueAddress = computed(() => inv.value.events?.[0]?.address || 'Calicut, Kerala')
const googleMapUrl = computed(() => inv.value.events?.[0]?.googleMapUrl || googleMapsOpenUrl(`${venueName.value} ${venueAddress.value}`))
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const coverImage = computed(() => inv.value.coverImage || def.backgroundImage)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')

const monogram = computed(() => {
  const g = groomName.value?.trim()?.charAt(0)?.toUpperCase() || 'R'
  const b = brideName.value?.trim()?.charAt(0)?.toUpperCase() || 'A'
  return `${g} & ${b}`
})

const formatDate = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year ?? 2000, (month ?? 1) - 1, day ?? 1)))
  } catch {
    return dateStr
  }
}

provide('invitation', inv)
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-x-hidden font-serif text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      backgroundColor: '#f9f1e9',
      fontFamily: `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
    }"
  >
    <!-- ==================== HERO SECTION ==================== -->
    <section id="hero-section" class="relative w-full overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          :src="coverImage"
          alt=""
          class="h-full w-full object-cover object-top"
          loading="eager"
        >
        <div class="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#f9f1e9]" />
      </div>

      <div class="relative z-10 mx-auto flex min-h-[88vh] max-w-lg flex-col items-center justify-center px-4 pb-20 pt-10 text-center sm:px-6">
        <div class="flex w-full flex-col items-center">
          <!-- Decorative line -->
          <div class="mb-20 flex items-center gap-10 text-rose-600/80">
            <Sparkles :size="1" />
            <span class="h-px w-12 bg-gradient-to-r from-transparent to-rose-400/70" />
            <Heart :size="1" class="fill-rose-500 text-rose-500" />
            <span class="h-px w-12 bg-gradient-to-l from-transparent to-rose-400/70" />
            <Sparkles :size="1" />
          </div>

          <!-- Couple Names -->
          <div class="mb-3 flex flex-col items-center gap-1">
            <h1 class="text-[clamp(1.85rem,9.5cqw,2.6rem)] font-medium tracking-wide text-rose-950 break-words leading-[1.1]">
              <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom Name" />
            </h1>
            <span class="text-xl font-light text-rose-600">&</span>
            <h1 class="text-[clamp(1.85rem,9.5cqw,2.6rem)] font-medium tracking-wide text-rose-950 break-words leading-[1.1]">
              <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride Name" />
            </h1>
          </div>

          <!-- Event Text -->
          <p class="mt-2 max-w-xs text-sm leading-relaxed text-rose-900/90">
            <TemplateEditable field="heroEventText" :value="heroEventText" as="span" placeholder="invite you to celebrate their wedding" />
          </p>

          <!-- Date & Time badges -->
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div class="flex items-center gap-1.5 rounded-full bg-white/75 px-3.5 py-1.5 backdrop-blur-md border border-rose-200/60 shadow-sm">
              <Calendar :size="14" class="text-rose-600" />
              <span class="text-xs font-medium text-rose-950">
                <TemplateEditable field="weddingDate" :value="formatDate(weddingDate)" as="span" placeholder="Wedding Date" />
              </span>
            </div>
            <div class="flex items-center gap-1.5 rounded-full bg-white/75 px-3.5 py-1.5 backdrop-blur-md border border-rose-200/60 shadow-sm">
              <Clock :size="14" class="text-rose-600" />
              <span class="text-xs font-medium text-rose-950">
                <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '10:00 AM'" as="span" placeholder="Time" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== MAIN BODY CONTENT ==================== -->
    <div class="relative z-10 mx-auto max-w-lg px-4 sm:px-6 pb-16">
      <!-- Parents & Blessings -->
      <section class="-mt-6 rounded-2xl bg-white/95 p-5 shadow-lg backdrop-blur-sm border border-rose-100/80">
        <div class="mb-4 flex items-center justify-center gap-2">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-rose-200" />
          <Heart :size="14" class="fill-rose-300 text-rose-400" />
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-rose-200" />
        </div>
        <div class="space-y-4 text-center">
          <div>
            <p class="mb-1 text-[10px] uppercase tracking-widest text-rose-400">Groom's Family</p>
            <p class="text-sm leading-relaxed text-rose-900">
              <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Mr. & Mrs. Rahman" multiline />
            </p>
          </div>
          <div class="mx-auto h-px w-12 bg-rose-200" />
          <div>
            <p class="mb-1 text-[10px] uppercase tracking-widest text-rose-400">Bride's Family</p>
            <p class="text-sm leading-relaxed text-rose-900">
              <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Mr. & Mrs. Ibrahim" multiline />
            </p>
          </div>
        </div>
      </section>

      <!-- Countdown -->
      <section class="mt-8 text-center">
        <h2 class="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-rose-800">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Counting Down To The Big Day" />
        </h2>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </section>

      <!-- Venue -->
      <section class="mt-8 rounded-2xl bg-white p-5 shadow-lg border border-rose-100/80">
        <div class="mb-3 flex items-center justify-center gap-2 text-rose-600">
          <MapPin :size="16" />
          <span class="text-xs font-semibold uppercase tracking-widest">Venue</span>
        </div>
        <h3 class="text-center text-lg font-medium text-rose-950">
          <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
        </h3>
        <p class="mt-1 text-center text-sm text-rose-700/90">
          <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" multiline />
        </p>
        <a
          :href="googleMapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-rose-600 hover:to-rose-700 active:scale-[0.98]"
        >
          <ExternalLink :size="15" />
          <span>Get Directions</span>
        </a>
      </section>

      <!-- Celebrations Section -->
      <TemplateCelebrations :show-events="showEvents" theme="rose" />

      <!-- Couple Photo Section -->
      <TemplateCouplePhoto
        :photo-url="couplePhoto"
        :groom-name="groomName"
        :bride-name="brideName"
        :show-photo-section="showPhotoSection"
        theme="rose"
      />

      <!-- RSVP Section -->
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="rose"
      />

      <!-- Footer -->
      <footer class="mt-12 mb-6 flex flex-col items-center text-center">
        <p class="max-w-[240px] text-xs leading-relaxed text-rose-700/90">
          With love &amp; blessings, we look forward to celebrating this joyous occasion with you.
        </p>
        <div class="mt-4 flex items-center gap-1.5 text-rose-300">
          <Sparkles :size="12" />
          <Heart :size="11" class="fill-current" />
          <Sparkles :size="12" />
        </div>
      </footer>
    </div>
  </div>
</template>
