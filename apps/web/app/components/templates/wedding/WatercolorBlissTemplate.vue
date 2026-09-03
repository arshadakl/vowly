<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl } from '@vowly/utils'
import { MapPin, CalendarDays, Sparkles } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('watercolor-bliss')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Sumit Gupta')
const brideName = computed(() => inv.value.brideName || 'Prerna Singh')
const weddingDate = computed(() => inv.value.weddingDate || '2027-07-25')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroTagline = computed(() => inv.value.customization.text.heroTagline || 'Together with their families')
const invitationText = computed(() => inv.value.customization.text.invitationText || 'cordially invite you to join the occasion of their joyous commitment')
const monogram = computed(() => inv.value.customization.text.monogram || 'P & S')
const weddingMonthYear = computed(() => inv.value.customization.text.weddingMonthYear || 'JULY 2027')
const weddingDayNumber = computed(() => inv.value.customization.text.weddingDayNumber || '25')
const weddingDay = computed(() => inv.value.customization.text.weddingDay || 'SUNDAY')
const weddingTimeDisplay = computed(() => inv.value.customization.text.weddingTime || '8:00 AM')
const venueAddress = computed(() => inv.value.events?.[0]?.address || '123 Anywhere St, Any City, ST 12345')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting Down')
const countdownSubtitle = computed(() => inv.value.customization.text.countdownSubtitle || 'Build excitement for the big day')
const daysLabel = computed(() => inv.value.customization.text.daysLabel || 'Days')
const hoursLabel = computed(() => inv.value.customization.text.hoursLabel || 'Hours')
const minutesLabel = computed(() => inv.value.customization.text.minutesLabel || 'Minutes')
const secondsLabel = computed(() => inv.value.customization.text.secondsLabel || 'Seconds')
const saveTheDateText = computed(() => inv.value.customization.text.saveTheDateText || 'Save to Calendar')
const calendarSubtitle = computed(() => inv.value.customization.text.calendarSubtitle || 'Guests can instantly add to Calendar')
const calendarDescription = computed(() => inv.value.customization.text.calendarDescription || 'Never miss a moment. Add the wedding celebration to your personal calendar in one click.')
const calendarButtonLabel = computed(() => inv.value.customization.text.calendarButtonLabel || 'Save the date')
const rsvpText = computed(() => inv.value.customization.text.rsvpText || 'With Love & Joy')
const footerDate = computed(() => inv.value.customization.text.footerDate || 'July 25, 2027')
const calendarEventTitle = computed(() => inv.value.customization.text.calendarEventTitle || `${brideName.value} & ${groomName.value}'s Wedding`)
const calendarEventDetails = computed(() => inv.value.customization.text.calendarEventDetails || `Join us for the joyous wedding celebration of ${brideName.value} and ${groomName.value}!`)
const heroBackgroundImage = computed(() => inv.value.coverImage || def.backgroundImage)
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')

const googleMapUrl = computed(() => {
  const url = inv.value.events?.[0]?.googleMapUrl
  if (url) return url
  return googleMapsOpenUrl(venueAddress.value)
})

const calendarUrl = computed(() => {
  const start = new Date(`${weddingDate.value} ${weddingTimeDisplay.value}`)
  if (Number.isNaN(start.getTime())) return '#'
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000)
  const formatGoogleDate = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: calendarEventTitle.value,
    dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    details: calendarEventDetails.value,
    location: venueAddress.value,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
})

provide('invitation', inv)
</script>

<template>
  <main
    class="relative min-h-screen w-full overflow-x-hidden bg-[#fdf8f4] font-[Lora] text-[#5a3c26] antialiased text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      fontFamily: `'Lora', Georgia, serif`,
    }"
  >
    <!-- ==================== HERO SECTION ==================== -->
    <section
      id="hero-section"
      class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-3 py-6 sm:px-5 sm:py-10 md:px-8"
      :style="{
        backgroundImage: `url('${heroBackgroundImage}')`,
        backgroundPosition: 'center center',
      }"
    >
      <div class="pointer-events-none absolute inset-0 bg-[rgba(253,248,244,0.08)]" />

      <!-- Hero Card -->
      <div
        class="relative z-10 mx-auto flex w-full max-w-[480px] justify-center"
      >
        <div
          class="relative w-full overflow-hidden rounded-t-[90px] rounded-b-[24px] border border-[rgba(212,175,55,0.4)] bg-[rgba(253,248,244,0.92)] px-5 pb-7 pt-8 text-center shadow-[0_10px_30px_rgba(90,60,38,0.12)] backdrop-blur-[10px] after:pointer-events-none after:absolute after:inset-[8px] after:rounded-t-[82px] after:rounded-b-[17px] after:border after:border-[rgba(184,134,11,0.25)] sm:rounded-t-[120px] sm:rounded-b-[28px] sm:px-7 sm:pb-9 sm:pt-[45px] sm:after:inset-[10px] sm:after:rounded-t-[112px] sm:after:rounded-b-[20px]"
        >
          <!-- Monogram -->
          <div class="relative z-[1] mb-3 inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#d4af37] bg-white/65 shadow-[0_4px_12px_rgba(212,175,55,0.15)] sm:mb-4 sm:h-[60px] sm:w-[60px]">
            <span class="font-[Lora] text-[0.85rem] font-semibold tracking-[2px] text-[#5a3c26] sm:text-[1rem]">
              <TemplateEditable field="monogram" :value="monogram" as="span" />
            </span>
          </div>

          <!-- Hero Tagline -->
          <p class="relative z-[1] mb-3 text-[0.68rem] font-semibold uppercase tracking-[1.8px] text-[#8c684d] sm:mb-[14px] sm:text-[0.85rem] sm:tracking-[2.5px]">
            <TemplateEditable field="heroTagline" :value="heroTagline" as="span" />
          </p>

          <!-- Names -->
          <h1 class="relative z-[1] mb-3 font-[Great_Vibes] text-[clamp(2.7rem,12cqw,4.5rem)] leading-[1.05] text-[#5a3c26] [text-shadow:0_1px_2px_rgba(255,255,255,0.9)] sm:mb-4 sm:leading-[1.25]">
            <TemplateEditable field="brideName" :value="brideName" as="span" class="font-[Great_Vibes]" />
            <span class="my-[-2px] block text-[0.65em] text-[#d4af37]">&amp;</span>
            <TemplateEditable field="groomName" :value="groomName" as="span" class="font-[Great_Vibes]" />
          </h1>

          <!-- Invitation Text -->
          <p class="relative z-[1] mx-auto mb-5 max-w-[320px] text-[0.82rem] italic leading-[1.55] text-[#5a3c26] sm:mb-6 sm:max-w-[360px] sm:text-[1rem]">
            <TemplateEditable field="invitationText" :value="invitationText" as="span" multiline />
          </p>

          <!-- Date Card -->
          <div class="relative z-[1] mb-4 rounded-[14px] border border-[rgba(212,175,55,0.35)] bg-white/65 px-3 py-3 sm:mb-[22px] sm:px-[14px] sm:py-4">
            <div class="mb-2 text-[0.72rem] font-semibold uppercase tracking-[2px] text-[#8c684d] sm:mb-[10px] sm:text-[0.85rem] sm:tracking-[3px]">
              <TemplateEditable field="weddingMonthYear" :value="weddingMonthYear" as="div" />
            </div>
            <div class="flex items-center justify-around">
              <!-- Day -->
              <div class="flex min-w-0 flex-1 flex-col items-center">
                <span class="mb-[2px] text-[0.55rem] uppercase tracking-[1px] text-[#8c684d] sm:text-[0.65rem] sm:tracking-[1.5px]">DAY</span>
                <span class="text-[0.68rem] font-semibold tracking-[1px] text-[#5a3c26] sm:text-[0.9rem] sm:tracking-[1.5px]">
                  <TemplateEditable field="weddingDay" :value="weddingDay" as="span" />
                </span>
              </div>
              <div class="h-8 w-px bg-[rgba(212,175,55,0.4)] sm:h-9" />
              <!-- Date -->
              <div class="flex flex-[0.8] justify-center sm:flex-[1.2]">
                <span class="text-[2rem] font-bold leading-none text-[#5a3c26] sm:text-[2.5rem]">
                  <TemplateEditable field="weddingDayNumber" :value="weddingDayNumber" as="span" />
                </span>
              </div>
              <div class="h-8 w-px bg-[rgba(212,175,55,0.4)] sm:h-9" />
              <!-- Time -->
              <div class="flex min-w-0 flex-1 flex-col items-center">
                <span class="mb-[2px] text-[0.55rem] uppercase tracking-[1px] text-[#8c684d] sm:text-[0.65rem] sm:tracking-[1.5px]">TIME</span>
                <span class="whitespace-nowrap text-[0.68rem] font-semibold tracking-[1px] text-[#5a3c26] sm:text-[0.9rem] sm:tracking-[1.5px]">
                  <TemplateEditable field="weddingTime" :value="weddingTimeDisplay" as="span" />
                </span>
              </div>
            </div>
          </div>

          <!-- Venue -->
          <div class="relative z-[1] inline-flex max-w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-[rgba(212,175,55,0.4)] bg-[rgba(253,248,244,0.9)] px-3 py-[9px] sm:rounded-[20px] sm:px-[18px] sm:py-[10px]">
            <MapPin :size="16" fill="#8c684d" class="shrink-0 text-[#8c684d] sm:h-[18px] sm:w-[18px]" />
            <span class="text-center text-[0.68rem] font-medium uppercase tracking-[0.5px] leading-[1.4] text-[#5a3c26] sm:text-[0.88rem] sm:tracking-[1px]">
              <TemplateEditable field="venueAddress" :value="venueAddress" as="span" multiline />
            </span>
          </div>

          <!-- Get Directions Button -->
          <a
            :href="googleMapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-[16px] border border-[rgba(212,175,55,0.5)] bg-[rgba(212,175,55,0.12)] text-[#5a3c26] text-[0.7rem] font-semibold uppercase tracking-[0.15em] hover:bg-[rgba(212,175,55,0.22)] transition-colors sm:text-[0.8rem] sm:px-6 sm:py-3"
          >
            <MapPin :size="14" />
            Get Directions
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== COUNTDOWN SECTION ==================== -->
    <section class="border-y border-[rgba(212,175,55,0.2)] bg-[linear-gradient(180deg,#fdf8f4_0%,#f9f0e8_100%)] px-4 py-14 text-center sm:px-5 sm:py-[75px]">
      <div class="mx-auto max-w-[800px]">
        <div class="mb-8 sm:mb-10">
          <h2 class="mb-[6px] block font-[Great_Vibes] text-[clamp(2.6rem,10cqw,3.8rem)] text-[#5a3c26]">
            <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" />
          </h2>
          <p class="block text-[0.72rem] font-semibold uppercase tracking-[1.5px] text-[#8c684d] sm:text-[0.92rem] sm:tracking-[2px]">
            <TemplateEditable field="countdownSubtitle" :value="countdownSubtitle" as="span" />
          </p>
        </div>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </div>
    </section>

    <!-- ==================== SAVE TO CALENDAR ==================== -->
    <section class="bg-[#fdf8f4] px-4 py-14 text-center sm:px-5 sm:py-[75px]">
      <div class="mx-auto max-w-[800px]">
        <div class="mx-auto max-w-[540px] rounded-[20px] border border-[rgba(212,175,55,0.4)] bg-white/85 px-5 py-7 shadow-[0_10px_30px_rgba(90,60,38,0.12)] sm:px-6 sm:py-[35px]">
          <div class="mb-5">
            <h2 class="mb-[6px] block font-[Great_Vibes] text-[clamp(2.6rem,10cqw,3.8rem)] text-[#5a3c26]">
              <TemplateEditable field="saveTheDateText" :value="saveTheDateText" as="span" />
            </h2>
            <p class="block text-[0.72rem] font-semibold uppercase tracking-[1.5px] text-[#8c684d] sm:text-[0.92rem] sm:tracking-[2px]">
              <TemplateEditable field="calendarSubtitle" :value="calendarSubtitle" as="span" />
            </p>
          </div>

          <p class="mb-5 block text-[0.88rem] leading-[1.6] text-[#5a3c26] sm:text-[0.95rem]">
            <TemplateEditable field="calendarDescription" :value="calendarDescription" as="span" multiline />
          </p>

          <div class="mt-5 flex flex-wrap items-center justify-center gap-[14px]">
            <a
              :href="calendarUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[25px] bg-[#7a2021] px-6 py-3 text-[0.78rem] font-semibold uppercase tracking-[1.2px] text-white no-underline shadow-[0_4px_12px_rgba(122,32,33,0.2)] hover:bg-[#5d1718] hover:-translate-y-0.5 active:scale-[0.97] transition-all sm:text-[0.85rem] sm:tracking-[1.5px]"
            >
              <CalendarDays :size="18" :stroke-width="2" />
              <span class="font-[Lora]">
                <TemplateEditable field="calendarButtonLabel" :value="calendarButtonLabel" as="span" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== SHARED SECTIONS ==================== -->
    <TemplateCelebrations :show-events="showEvents" theme="light" />
    <TemplateCouplePhoto
      :photo-url="couplePhoto"
      :groom-name="groomName"
      :bride-name="brideName"
      :show-photo-section="showPhotoSection"
      theme="light"
    />
    <TemplateRsvp v-if="inv.rsvp?.enabled"       :groom-name="groomName"
      :bride-name="brideName"
      :whatsapp-number="whatsappNumber"
      theme="light"
    />

    <!-- ==================== FOOTER ==================== -->
    <footer class="border-t border-[rgba(212,175,55,0.4)] bg-[#f4eadf] px-4 py-8 text-center text-[0.8rem] text-[#8c684d] sm:px-5 sm:py-10 sm:text-[0.88rem]">
      <p class="mb-2 font-[Great_Vibes] text-[2rem] text-[#5a3c26] sm:text-[2.2rem]">
        <TemplateEditable field="brideName" :value="brideName" as="span" class="font-[Great_Vibes]" />
        <span class="text-[0.65em] text-[#d4af37]">&amp;</span>
        <TemplateEditable field="groomName" :value="groomName" as="span" class="font-[Great_Vibes]" />
      </p>
      <p class="leading-relaxed">
        <span class="font-[Lora]">
          <TemplateEditable field="rsvpText" :value="rsvpText" as="span" />
        </span>
        <span class="mx-1">&middot;</span>
        <span class="font-[Lora]">
          <TemplateEditable field="footerDate" :value="footerDate || inv.weddingDate" as="span" />
        </span>
      </p>
    </footer>
  </main>
</template>
