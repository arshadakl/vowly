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

const def = getTemplateDefinition('pink-rose-sofa-romance')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Rizwan')
const brideName = computed(() => inv.value.brideName || 'Ayesha')
const groomParents = computed(() => inv.value.groomParents || 'Son of Mr. & Mrs. Rahman')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Mr. & Mrs. Ibrahim')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-25')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroEventText = computed(() => inv.value.customization.text.heroEventText || 'together with their families joyfully invite you')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Our Special Day')
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
      backgroundColor: '#fdf6f2',
      fontFamily: `'Playfair Display', 'Cormorant Garamond', Georgia, serif`,
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
        <div class="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[#fdf6f2]" />
      </div>

      <div class="relative z-10 mx-auto flex min-h-[92vh] max-w-lg flex-col items-center justify-center px-5 pb-28 pt-12 text-center">
        <!-- Decorative top -->
        <div class="mb-6 flex items-center gap-2">
          <div class="h-px w-8 bg-pink-300/70" />
          <Sparkles :size="13" class="text-pink-400" />
          <div class="h-px w-8 bg-pink-300/70" />
        </div>

        <!-- GROOM + PARENTS -->
        <div class="mb-1">
          <h1 class="text-[2rem] font-medium tracking-wide text-stone-800 sm:text-[2.35rem]">
            <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom Name" />
          </h1>
        </div>

        <div>
          <p class="mt-1 text-[12.5px] font-light tracking-wide text-stone-500">
            <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Mr. & Mrs. Rahman" />
          </p>
        </div>

        <!-- Divider -->
        <div class="my-4 flex items-center gap-2 text-pink-400">
          <span class="text-sm">✿</span>
          <span class="text-lg font-light text-stone-400">&amp;</span>
          <span class="text-sm">✿</span>
        </div>

        <!-- BRIDE + PARENTS -->
        <div>
          <h1 class="text-[2rem] font-medium tracking-wide text-stone-800 sm:text-[2.35rem]">
            <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride Name" />
          </h1>
        </div>

        <div>
          <p class="mt-1 text-[12.5px] font-light tracking-wide text-stone-500">
            <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Mr. & Mrs. Ibrahim" />
          </p>
        </div>

        <!-- Event text -->
        <div class="mt-6">
          <p class="max-w-[270px] text-[13.5px] font-light leading-relaxed text-stone-600">
            <TemplateEditable field="heroEventText" :value="heroEventText" as="span" placeholder="together with their families joyfully invite you" />
          </p>
        </div>

        <!-- Date & Time -->
        <div class="mt-8 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-4">
          <div class="flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/75 px-4 py-1.5 backdrop-blur-sm">
            <Calendar :size="13" class="text-pink-500" />
            <span class="text-[12px] font-medium text-stone-700">
              <TemplateEditable field="weddingDate" :value="formatDate(weddingDate)" as="span" placeholder="Wedding Date" />
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/75 px-4 py-1.5 backdrop-blur-sm">
            <Clock :size="13" class="text-pink-500" />
            <span class="text-[12px] font-medium text-stone-700">
              <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '10:00 AM'" as="span" placeholder="Time" />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== MAIN CONTENT ==================== -->
    <div class="relative z-10 mx-auto max-w-lg px-5 pb-20">
      <!-- Countdown -->
      <section class="mt-6 text-center">
        <h2 class="mb-7 text-[11px] font-medium uppercase tracking-[0.28em] text-pink-600">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Our Special Day" />
        </h2>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </section>

      <!-- Venue -->
      <section class="mt-12 rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-center gap-2">
          <MapPin :size="15" class="text-pink-500" />
          <span class="text-[10px] font-medium uppercase tracking-[0.25em] text-pink-600">
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
          class="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-pink-500 py-2.5 text-[13px] font-medium tracking-wide text-white transition hover:bg-pink-600 active:scale-[0.98]"
        >
          <ExternalLink :size="14" />
          Get Directions
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
      <footer class="mt-14 flex flex-col items-center text-center">
        <div
          class="mb-4 flex items-center justify-center rounded-full border border-pink-200 bg-white text-sm font-medium tracking-widest text-pink-800 shadow-sm"
          style="width: 52px; height: 52px"
        >
          {{ monogram }}
        </div>

        <p class="max-w-[240px] text-[12.5px] font-light leading-relaxed text-stone-500">
          We look forward to celebrating this beautiful moment with you.
        </p>

        <div class="mt-5 flex items-center gap-2 text-pink-300">
          <span class="text-sm">✿</span>
          <Heart :size="12" class="fill-current" />
          <span class="text-sm">✿</span>
        </div>
      </footer>
    </div>
  </div>
</template>
