<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl } from '@vowly/utils'
import { Calendar, MapPin, Clock, Sparkles, Heart, Navigation, CalendarCheck } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('standard-crimson')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Rizwan Ahmed')
const brideName = computed(() => inv.value.brideName || 'Ayesha Fathima')
const groomParents = computed(() => inv.value.groomParents || 'Son of Mr. & Mrs. Rahman')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Mr. & Mrs. Ibrahim')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-12')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroTagline = computed(() => inv.value.customization.text.heroTagline || "Together with their families")
const heroEventText = computed(() => inv.value.customization.text.heroEventText || "are entering into Nikah, insha'Allah")
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting Down to Forever')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'Kadaloram Convention Centre')
const venueAddress = computed(() => inv.value.events?.[0]?.address || 'Beach Road, Kozhikode (Calicut), Kerala 673032')
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

const handleAddToCalendar = () => {
  try {
    const dateMatch = weddingDate.value.match(/\d{4}-\d{2}-\d{2}/)
    const dateValue = dateMatch ? dateMatch[0].replace(/-/g, '') : '20261212'
    const startIso = `${dateValue}T100000`
    const endIso = `${dateValue}T220000`
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${groomName.value}-${brideName.value}-Wedding//EN`,
      'BEGIN:VEVENT',
      `UID:${Date.now()}@vowly.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${groomName.value} & ${brideName.value}'s Wedding`,
      `DESCRIPTION:Wedding celebration of ${groomName.value} and ${brideName.value}.`,
      `LOCATION:${venueName.value}, ${venueAddress.value}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', `${groomName.value}-${brideName.value}-Wedding.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (e) {
    console.warn('Calendar download error:', e)
  }
}

const petals = Array.from({ length: 14 }).map((_, i) => ({
  id: i,
  left: `${(i * 7.1 + 3) % 100}%`,
  size: 6 + ((i * 2.2) % 6),
  duration: 12 + ((i * 1.5) % 8),
  delay: (i * 0.7) % 6,
}))

provide('invitation', inv)
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-x-hidden antialiased text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      '--gold': '#E8C882',
      backgroundColor: '#F9F5EE',
      fontFamily: `'Cormorant Garamond', 'Playfair Display', Georgia, serif`,
    }"
  >
    <!-- ==================== HERO SECTION ==================== -->
    <section id="hero-section" class="relative w-full overflow-hidden">
      <!-- Background Image & Vignette -->
      <div class="absolute inset-0 z-0">
        <img
          :src="coverImage"
          alt="Royal Crimson Background"
          class="h-full w-full object-cover object-center scale-[1.02]"
          loading="eager"
        >
        <div class="absolute inset-0 bg-gradient-to-b from-[#1C0407]/60 via-[#120305]/75 to-[#F9F5EE]" />
      </div>

      <!-- Floating Ambient Petals -->
      <div class="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <div
          v-for="petal in petals"
          :key="petal.id"
          class="petal absolute shadow-sm"
          :style="{
            left: petal.left,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            background: 'radial-gradient(circle at 35% 35%, #C23B47, #5C101A)',
            borderRadius: '60% 5% 60% 5%',
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
          }"
        />
      </div>

      <!-- Hero Content -->
      <div class="relative z-20 mx-auto flex min-h-[92vh] max-w-lg flex-col items-center justify-end px-5 pb-24 pt-20 text-center">
        <!-- Top Ornamental Divider -->
        <div class="mb-5 flex items-center justify-center gap-3 text-[#E8C882]">
          <div class="h-px w-10 bg-gradient-to-r from-transparent to-[#E8C882]/70" />
          <Sparkles :size="14" class="text-[#E8C882]" />
          <div class="h-px w-10 bg-gradient-to-l from-transparent to-[#E8C882]/70" />
        </div>

        <!-- Tagline -->
        <p class="mb-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-[#E8C882]/90">
          <TemplateEditable field="heroTagline" :value="heroTagline" as="span" placeholder="Together with their families" />
        </p>

        <!-- Groom Name -->
        <h1 class="text-[2.35rem] sm:text-[2.85rem] font-normal tracking-tight leading-[1.1] text-[#FFFDF8] drop-shadow-md">
          <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom Name" />
        </h1>

        <!-- Groom Parents -->
        <p class="mt-1 text-[12px] font-light tracking-wide text-[#E8C882]/75">
          <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Mr. & Mrs. Rahman" />
        </p>

        <!-- Ampersand Divider -->
        <div class="my-3 flex items-center justify-center gap-3 text-[#E8C882]">
          <div class="h-px w-8 bg-[#E8C882]/35" />
          <span class="text-xl font-light italic text-[#E8C882]">&</span>
          <div class="h-px w-8 bg-[#E8C882]/35" />
        </div>

        <!-- Bride Name -->
        <h1 class="text-[2.35rem] sm:text-[2.85rem] font-normal tracking-tight leading-[1.1] text-[#FFFDF8] drop-shadow-md">
          <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride Name" />
        </h1>

        <!-- Bride Parents -->
        <p class="mt-1 text-[12px] font-light tracking-wide text-[#E8C882]/75">
          <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Mr. & Mrs. Ibrahim" />
        </p>

        <!-- Hero Event Text -->
        <p class="mt-4 max-w-[290px] text-[13.5px] font-light italic leading-relaxed tracking-wide text-[#FFF4DF]/90">
          <TemplateEditable field="heroEventText" :value="heroEventText" as="span" placeholder="are entering into Nikah, insha'Allah" />
        </p>

        <!-- Date & Time Badges -->
        <div class="mt-7 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3.5">
          <div class="flex items-center gap-2 rounded-full border border-[#E8C882]/30 bg-black/40 px-4 py-1.5 shadow-lg backdrop-blur-md">
            <Calendar :size="13" class="text-[#E8C882]" />
            <span class="text-[11.5px] font-medium tracking-wide text-[#FFFDF8]">
              <TemplateEditable field="weddingDate" :value="formatDate(weddingDate)" as="span" placeholder="Wedding Date" />
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-[#E8C882]/30 bg-black/40 px-4 py-1.5 shadow-lg backdrop-blur-md">
            <Clock :size="13" class="text-[#E8C882]" />
            <span class="text-[11.5px] font-medium tracking-wide text-[#FFFDF8]">
              <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '10:00 AM'" as="span" placeholder="Time" />
            </span>
          </div>
        </div>

        <!-- Add to Calendar -->
        <button
          type="button"
          class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#E8C882]/40 bg-[#E8C882]/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#FFF4DF] backdrop-blur-md transition-all hover:bg-[#E8C882]/25 active:scale-95"
          @click="handleAddToCalendar"
        >
          <CalendarCheck :size="13" class="text-[#E8C882]" />
          <span>Add to Calendar</span>
        </button>
      </div>
    </section>

    <!-- ==================== MAIN BODY CONTENT ==================== -->
    <div class="relative z-10 mx-auto max-w-lg px-4 sm:px-5 pb-20">
      <!-- Countdown Section -->
      <section class="mt-4 text-center">
        <h2 class="mb-5 text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.28em] text-[#7A5836]">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Counting Down to Forever" />
        </h2>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
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

      <!-- Venue Section -->
      <section
        id="venue-section"
        class="mt-10 overflow-hidden rounded-[2rem] border border-rose-900/15 bg-white/90 p-6 sm:p-7 shadow-[0_20px_50px_rgba(74,23,31,0.05)] backdrop-blur-xl"
      >
        <div class="mb-4 flex items-center justify-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-[#8A212E]">
            <MapPin :size="15" />
          </div>
          <span class="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#8A212E]">
            The Venue
          </span>
        </div>

        <h3 class="text-center text-xl sm:text-2xl font-bold tracking-tight text-[#4A171F]">
          <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
        </h3>

        <p class="mt-1.5 text-center text-xs sm:text-sm font-light text-stone-600 leading-relaxed">
          <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" multiline />
        </p>

        <a
          :href="googleMapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4A171F] py-3 text-xs sm:text-sm font-bold tracking-wide text-white shadow-lg shadow-[#4A171F]/20 hover:bg-[#3B0A11] active:scale-[0.98] transition-all"
        >
          <Navigation :size="14" />
          <span>Get Directions on Google Maps</span>
        </a>
      </section>

      <!-- RSVP Section -->
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="crimson"
      />

      <!-- Footer -->
      <TemplateFooter
        :initial="monogram"
        blessing="We can't wait to celebrate this beautiful beginning with you."
        bg="bg-transparent"
        text-color="text-stone-600"
        accent-color="text-[#C6A66A]"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes petalFloat {
  0% {
    transform: translateY(-10%) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.75;
  }
  90% {
    opacity: 0.75;
  }
  100% {
    transform: translateY(120vh) rotate(360deg);
    opacity: 0;
  }
}
.petal {
  animation: petalFloat linear infinite;
  will-change: transform, opacity;
}
</style>
