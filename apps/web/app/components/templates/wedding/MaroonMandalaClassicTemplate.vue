<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl } from '@vowly/utils'
import { Calendar, MapPin, Clock, Sparkles, ExternalLink, Heart } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('maroon-mandala-classic')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Rizwan')
const brideName = computed(() => inv.value.brideName || 'Ayesha')
const groomParents = computed(() => inv.value.groomParents || 'Son of Mr. & Mrs. Rahman')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Mr. & Mrs. Ibrahim')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-25')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroEventText = computed(() => inv.value.customization.text.heroEventText || 'cordially invite you to their wedding celebration')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'The Big Day Approaches')
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
      backgroundColor: '#faf7f2',
      fontFamily: `'Cinzel', 'Playfair Display', 'Times New Roman', serif`,
    }"
  >
    <!-- ==================== HERO SECTION ==================== -->
    <section id="hero-section" class="relative w-full overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          :src="coverImage"
          alt=""
          class="h-full w-full object-cover object-center"
          loading="eager"
        >
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#faf7f2]" />
      </div>

      <div class="relative z-10 mx-auto flex min-h-[88vh] max-w-lg flex-col items-center justify-center px-5 pb-24 pt-16 text-center">
        <!-- Top decorative element -->
        <div class="mb-8 flex items-center gap-3">
          <div class="h-px w-10 bg-rose-800/40" />
          <div class="h-2 w-2 rotate-45 border border-rose-800/50" />
          <div class="h-px w-10 bg-rose-800/40" />
        </div>

        <!-- Names -->
        <h1 class="text-[clamp(1.85rem,9.5cqw,2.5rem)] font-normal tracking-[0.12em] text-rose-950 break-words leading-[1.1]">
          <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom Name" />
        </h1>

        <div class="my-2 text-lg tracking-[0.35em] text-rose-800/80">
          &amp;
        </div>

        <h1 class="text-[clamp(1.85rem,9.5cqw,2.5rem)] font-normal tracking-[0.12em] text-rose-950 break-words leading-[1.1]">
          <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride Name" />
        </h1>

        <!-- Event text -->
        <div class="mt-6">
          <p class="max-w-[280px] text-[13.5px] font-light leading-relaxed tracking-wide text-rose-900/80">
            <TemplateEditable field="heroEventText" :value="heroEventText" as="span" placeholder="cordially invite you to their wedding celebration" />
          </p>
        </div>

        <!-- Date & Time -->
        <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <div class="flex items-center gap-2 rounded-full border border-rose-800/25 bg-white/70 px-4 py-1.5 backdrop-blur-sm">
            <Calendar :size="13" class="text-rose-800" />
            <span class="text-[12px] font-medium tracking-wide text-rose-950">
              <TemplateEditable field="weddingDate" :value="formatDate(weddingDate)" as="span" placeholder="Wedding Date" />
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-rose-800/25 bg-white/70 px-4 py-1.5 backdrop-blur-sm">
            <Clock :size="13" class="text-rose-800" />
            <span class="text-[12px] font-medium tracking-wide text-rose-950">
              <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '10:00 AM'" as="span" placeholder="Time" />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== MAIN CONTENT ==================== -->
    <div class="relative z-10 mx-auto max-w-lg px-5 pb-20">
      <!-- Parents -->
      <section class="-mt-4 rounded-2xl border border-rose-900/15 bg-white/95 p-6 shadow-sm">
        <div class="mb-5 flex items-center justify-center gap-3">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-rose-800/30" />
          <span class="text-[10px] uppercase tracking-[0.3em] text-rose-800/70">
            With the Blessings of
          </span>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-rose-800/30" />
        </div>

        <div class="space-y-5 text-center">
          <div>
            <p class="text-[14px] font-light leading-relaxed tracking-wide text-rose-950">
              <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Mr. & Mrs. Rahman" multiline />
            </p>
          </div>
          <div class="mx-auto h-px w-12 bg-rose-800/25" />
          <div>
            <p class="text-[14px] font-light leading-relaxed tracking-wide text-rose-950">
              <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Mr. & Mrs. Ibrahim" multiline />
            </p>
          </div>
        </div>
      </section>

      <!-- Countdown -->
      <section class="mt-12 text-center">
        <h2 class="mb-7 text-[11px] font-medium uppercase tracking-[0.32em] text-rose-800/80">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="The Big Day Approaches" />
        </h2>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </section>

      <!-- Venue -->
      <section class="mt-12 rounded-2xl border border-rose-900/15 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-center gap-2">
          <MapPin :size="15" class="text-rose-800" />
          <span class="text-[10px] font-medium uppercase tracking-[0.28em] text-rose-800/80">
            Venue
          </span>
        </div>

        <h3 class="text-center text-lg font-medium tracking-wide text-rose-950">
          <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
        </h3>

        <p class="mt-1.5 text-center text-[13px] font-light tracking-wide text-rose-900/70">
          <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" multiline />
        </p>

        <a
          :href="googleMapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-rose-900 py-2.5 text-[13px] font-medium tracking-wide text-white transition hover:bg-rose-800 active:scale-[0.98]"
        >
          <ExternalLink :size="14" />
          Get Directions
        </a>
      </section>

      <!-- Celebrations Section -->
      <TemplateCelebrations :show-events="showEvents" theme="crimson" />

      <!-- Couple Photo Section -->
      <TemplateCouplePhoto
        :photo-url="couplePhoto"
        :groom-name="groomName"
        :bride-name="brideName"
        :show-photo-section="showPhotoSection"
        theme="crimson"
      />

      <!-- RSVP Section -->
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="crimson"
      />
    </div>
  </div>
</template>
