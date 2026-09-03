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
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('rose-gold-temple')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Rizwan')
const brideName = computed(() => inv.value.brideName || 'Ayesha')
const groomParents = computed(() => inv.value.groomParents || 'Son of Mr. & Mrs. Rahman')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Mr. & Mrs. Ibrahim')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-25')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroEventText = computed(() => inv.value.customization.text.heroEventText || 'with divine blessings invite you to celebrate')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'The Sacred Day')
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
    class="relative min-h-screen w-full overflow-x-hidden text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      backgroundColor: '#fdf6f0',
      fontFamily: `'Cinzel', 'Playfair Display', 'Times New Roman', serif`,
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
        <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[#fdf6f0]" />
      </div>

      <div class="relative z-10 mx-auto flex min-h-[94vh] max-w-lg flex-col items-center justify-end px-5 pb-40 pt-28 text-center sm:pb-44">
        <div class="flex w-full flex-col items-center">
          <!-- Decorative top – temple lamp -->
          <div class="mb-5 flex items-center gap-2">
            <div class="h-px w-8 bg-rose-400/60" />
            <span class="text-rose-600 text-base">🪔</span>
            <div class="h-px w-8 bg-rose-400/60" />
          </div>

          <!-- Groom Name -->
          <h1 class="text-[clamp(1.85rem,9.5cqw,2.5rem)] font-normal tracking-[0.06em] text-stone-800 break-words leading-[1.1]">
            <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom Name" />
          </h1>

          <!-- Groom Parents -->
          <p class="mt-1.5 text-[12.5px] font-light tracking-wide text-stone-500">
            <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Mr. & Mrs. Rahman" />
          </p>

          <!-- Divider ✦ & ✦ -->
          <div class="my-4 flex items-center gap-2 text-rose-500">
            <span class="text-sm">✦</span>
            <span class="text-lg font-light text-stone-400">&amp;</span>
            <span class="text-sm">✦</span>
          </div>

          <!-- Bride Name -->
          <h1 class="text-[clamp(1.85rem,9.5cqw,2.5rem)] font-normal tracking-[0.06em] text-stone-800 break-words leading-[1.1]">
            <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride Name" />
          </h1>

          <!-- Bride Parents -->
          <p class="mt-1.5 text-[12.5px] font-light tracking-wide text-stone-500">
            <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Mr. & Mrs. Ibrahim" />
          </p>

          <!-- Event text -->
          <p class="mt-5 max-w-[270px] text-[13.5px] font-light leading-relaxed text-stone-600">
            <TemplateEditable field="heroEventText" :value="heroEventText" as="span" placeholder="with divine blessings invite you to celebrate" />
          </p>

          <!-- Date & Time -->
          <div class="mt-7 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-4">
            <div class="flex items-center gap-2 rounded-full border border-rose-300/60 bg-white/75 px-4 py-1.5 backdrop-blur-sm">
              <Calendar :size="13" class="text-rose-600" />
              <span class="text-[12px] font-medium text-stone-700">
                <TemplateEditable field="weddingDate" :value="formatDate(weddingDate)" as="span" placeholder="Wedding Date" />
              </span>
            </div>
            <div class="flex items-center gap-2 rounded-full border border-rose-300/60 bg-white/75 px-4 py-1.5 backdrop-blur-sm">
              <Clock :size="13" class="text-rose-600" />
              <span class="text-[12px] font-medium text-stone-700">
                <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '10:00 AM'" as="span" placeholder="Time" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== MAIN BODY CONTENT ==================== -->
    <div class="relative z-10 mx-auto max-w-lg px-5 pb-20">
      <!-- Countdown -->
      <section class="mt-4 text-center">
        <h2 class="mb-7 text-[11px] font-medium uppercase tracking-[0.28em] text-rose-800">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="The Sacred Day" />
        </h2>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </section>

      <!-- Venue -->
      <section class="mt-12 rounded-3xl border border-rose-200/70 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-center gap-2">
          <MapPin :size="15" class="text-rose-600" />
          <span class="text-[10px] font-medium uppercase tracking-[0.25em] text-rose-700">Venue</span>
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
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-rose-700 py-2.5 text-[13px] font-medium tracking-wide text-white transition hover:bg-rose-800 active:scale-[0.98]"
        >
          <ExternalLink :size="14" />
          <span>Get Directions</span>
        </a>
      </section>

      <!-- Celebrations Section -->
      <TemplateCelebrations :show-events="showEvents" theme="gold" />

      <!-- Couple Photo Section -->
      <TemplateCouplePhoto
        :photo-url="couplePhoto"
        :groom-name="groomName"
        :bride-name="brideName"
        :show-photo-section="showPhotoSection"
        theme="gold"
      />

      <!-- RSVP Section -->
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="gold"
      />

      <!-- Footer -->
      <footer class="mt-14 flex flex-col items-center text-center">
        <div class="mb-4 flex items-center justify-center rounded-full border border-rose-300/60 bg-white text-sm font-medium tracking-widest text-rose-800 shadow-sm" style="width: 52px; height: 52px;">
          {{ monogram }}
        </div>
        <p class="max-w-[240px] text-[12.5px] font-light leading-relaxed text-stone-500">
          May this sacred union be blessed with love, joy and prosperity.
        </p>
      </footer>
    </div>
  </div>
</template>
