<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl, fontIdToCss } from '@vowly/utils'
import { Calendar, MapPin, Clock, Sparkles, ExternalLink, Heart } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('lavender-blush-proposal')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Rizwan')
const brideName = computed(() => inv.value.brideName || 'Ayesha')
const groomParents = computed(() => inv.value.groomParents || 'Son of Mr. & Mrs. Rahman')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Mr. & Mrs. Ibrahim')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-25')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroEventText = computed(() => inv.value.customization.text.heroEventText || 'joyfully invite you to celebrate their wedding')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting the Moments')
const countdownEndedTitle = computed(() => inv.value.customization.text.countdownEndedTitle || 'Wedding in Progress!')
const countdownEndedSubtitle = computed(() => inv.value.customization.text.countdownEndedSubtitle || 'Thank you for celebrating this joyful occasion with us.')
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
    class="relative min-h-screen w-full overflow-x-hidden antialiased text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      backgroundColor: '#fdf6f0',
      fontFamily: fontIdToCss(inv.customization?.fontFamily),
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
        <div class="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#fdf6f0]" />
      </div>

      <div class="relative z-10 mx-auto flex min-h-[90vh] max-w-lg flex-col items-center justify-center px-5 pb-28 pt-14 text-center">
        <!-- Decorative Sparkles -->
        <div class="mb-7 flex items-center gap-2.5">
          <div class="h-px w-8 bg-violet-300/70" />
          <Sparkles :size="13" class="text-violet-400" />
          <div class="h-px w-8 bg-violet-300/70" />
        </div>

        <!-- Groom -->
        <h1 class="text-[2rem] font-medium tracking-wide text-stone-800 sm:text-[2.4rem]">
          <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom Name" />
        </h1>

        <!-- Ampersand -->
        <div class="my-1.5 text-lg font-light text-violet-400">
          &amp;
        </div>

        <!-- Bride -->
        <h1 class="text-[2rem] font-medium tracking-wide text-stone-800 sm:text-[2.4rem]">
          <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride Name" />
        </h1>

        <!-- Event text -->
        <div class="mt-5">
          <p class="max-w-[270px] text-[13.5px] font-light leading-relaxed text-stone-600">
            <TemplateEditable field="heroEventText" :value="heroEventText" as="span" placeholder="joyfully invite you to celebrate their wedding" />
          </p>
        </div>

        <!-- Date & Time -->
        <div class="mt-9 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-4">
          <div class="flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/70 px-4 py-1.5 backdrop-blur-sm">
            <Calendar :size="13" class="text-violet-500" />
            <span class="text-[12px] font-medium text-stone-700">
              <TemplateEditable field="weddingDate" :value="formatDate(weddingDate)" as="span" placeholder="Wedding Date" />
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/70 px-4 py-1.5 backdrop-blur-sm">
            <Clock :size="13" class="text-violet-500" />
            <span class="text-[12px] font-medium text-stone-700">
              <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '10:00 AM'" as="span" placeholder="Time" />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== MAIN CONTENT ==================== -->
    <div class="relative z-10 mx-auto max-w-lg px-5 pb-20">
      <!-- Parents -->
      <section class="-mt-6 rounded-3xl border border-violet-100 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
        <div class="mb-5 flex items-center justify-center gap-3">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-violet-200" />
          <span class="text-[10px] uppercase tracking-[0.25em] text-violet-400">
            With Love &amp; Blessings
          </span>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-violet-200" />
        </div>

        <div class="space-y-5 text-center">
          <div>
            <p class="text-[14px] font-light leading-relaxed text-stone-700">
              <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Mr. & Mrs. Rahman" multiline />
            </p>
          </div>
          <div class="mx-auto h-px w-10 bg-violet-200" />
          <div>
            <p class="text-[14px] font-light leading-relaxed text-stone-700">
              <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Mr. & Mrs. Ibrahim" multiline />
            </p>
          </div>
        </div>
      </section>

      <!-- Countdown -->
      <section class="mt-12 text-center">
        <h2 class="mb-7 text-[11px] font-medium uppercase tracking-[0.28em] text-violet-500">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Counting the Moments" />
        </h2>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </section>

      <!-- Venue -->
      <section class="mt-12 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-center gap-2">
          <MapPin :size="15" class="text-violet-500" />
          <span class="text-[10px] font-medium uppercase tracking-[0.25em] text-violet-500">
            Venue
          </span>
        </div>

        <h3 class="text-center text-lg font-medium tracking-wide text-stone-800">
          <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
        </h3>
        <p class="mt-1.5 text-center text-[13px] font-light text-stone-500">
          <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" multiline />
        </p>

        <a
          :href="googleMapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-violet-500 py-2.5 text-[13px] font-medium tracking-wide text-white transition hover:bg-violet-600 active:scale-[0.98]"
        >
          <ExternalLink :size="14" />
          Get Directions
        </a>
      </section>

      <!-- Celebrations -->
      <TemplateCelebrations :show-events="showEvents" theme="rose" />

      <!-- Couple Photo -->
      <TemplateCouplePhoto
        :photo-url="couplePhoto"
        :groom-name="groomName"
        :bride-name="brideName"
        :show-photo-section="showPhotoSection"
        theme="rose"
      />

      <!-- RSVP -->
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="rose"
      />

      <!-- Footer -->
      <footer class="mt-14 flex flex-col items-center text-center">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-violet-200 bg-white text-sm font-medium tracking-widest text-violet-700 shadow-sm">
          {{ monogram }}
        </div>
        <p class="max-w-[230px] text-[12.5px] font-light leading-relaxed text-stone-500">
          We can't wait to celebrate this beautiful day with you.
        </p>
        <div class="mt-5 flex items-center gap-2.5 text-violet-300">
          <div class="h-px w-7 bg-violet-200" />
          <Heart :size="12" class="fill-current" />
          <div class="h-px w-7 bg-violet-200" />
        </div>
      </footer>
    </div>
  </div>
</template>
