<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl, fontIdToCss } from '@vowly/utils'
import { CalendarDays, Clock3, MapPin, Navigation, Sparkles } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('modern-navy')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Daniel')
const brideName = computed(() => inv.value.brideName || 'Olivia')
const weddingDate = computed(() => inv.value.weddingDate || '2028-06-17')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'Borcelle Ballroom')
const venueAddress = computed(() => inv.value.events?.[0]?.address || '123 Celebration Boulevard, Grand City')
const googleMapUrl = computed(() => inv.value.events?.[0]?.googleMapUrl || googleMapsOpenUrl(`${venueName.value} ${venueAddress.value}`))
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')
const coverImage = computed(() => inv.value.coverImage || def.backgroundImage)

const heroIntro = computed(() => inv.value.customization.text.heroIntro || 'Together With Their Families')
const heroTagline = computed(() => inv.value.customization.text.heroTagline || 'joyfully invite you to celebrate their wedding day')
const countdownBadge = computed(() => inv.value.customization.text.countdownBadge || 'Build Excitement')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting Down to the Big Day')
const countdownText = computed(() => inv.value.customization.text.countdownText || 'Every second brings us closer to celebrating our love together with you!')
const saveTheDateBadge = computed(() => inv.value.customization.text.saveTheDateBadge || 'Save to Calendar')
const saveTheDateTitle = computed(() => inv.value.customization.text.saveTheDateTitle || "Don't Miss the Celebration")
const saveTheDateText = computed(() => inv.value.customization.text.saveTheDateText || "Instantly add the wedding to your personal calendar so you don't miss a moment.")
const saveTheDateButton = computed(() => inv.value.customization.text.saveTheDateButton || 'Save the date')
const venueSectionTitle = computed(() => inv.value.customization.text.venueSectionTitle || 'Venue & Directions')
const venueSectionText = computed(() => inv.value.customization.text.venueSectionText || "We can't wait to welcome you to our wedding venue")
const locationDetailsTitle = computed(() => inv.value.customization.text.locationDetailsTitle || 'Location Details')
const addressLabel = computed(() => inv.value.customization.text.addressLabel || 'Address:')
const ceremonyLabel = computed(() => inv.value.customization.text.ceremonyLabel || 'Ceremony Start:')
const parkingLabel = computed(() => inv.value.customization.text.parkingLabel || 'Guest Parking:')
const parkingText = computed(() => inv.value.customization.text.parkingText || 'Complimentary valet parking available at venue entrance.')
const directionsButton = computed(() => inv.value.customization.text.directionsButton || 'Get Directions in Google Maps')
const footerMessage = computed(() => inv.value.customization.text.footerMessage || 'We look forward to seeing you!')

const coupleNames = computed(() => `${brideName.value} & ${groomName.value}`)

const formatDateShort = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Intl.DateTimeFormat('en-US', {
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

const weddingDateDisplay = computed(() => formatDateShort(weddingDate.value))

const weddingDateShort = computed(() => {
  try {
    const [year, month, day] = weddingDate.value.split('-').map(Number)
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year ?? 2000, (month ?? 1) - 1, day ?? 1)))
  } catch {
    return weddingDate.value
  }
})

const googleCalendarUrl = computed(() => {
  const text = `${coupleNames.value}'s Wedding`
  const details = `Join us for a celebration at the wedding of ${coupleNames.value}!`
  const location = `${venueName.value}, ${venueAddress.value}`
  const dateStr = weddingDate.value.replace(/-/g, '')
  const startTime = (inv.value.events?.[0]?.startTime || '16:00').replace(':', '') + '00'
  const endTime = (inv.value.events?.[0]?.endTime || '23:00').replace(':', '') + '00'
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${dateStr}T${startTime}Z/${dateStr}T${endTime}Z&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
})

provide('invitation', inv)
</script>

<template>
  <main
    class="relative min-h-screen w-full overflow-x-hidden bg-[#f4f8fb] font-['Lora'] leading-relaxed text-[#4a5d73] text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      fontFamily: fontIdToCss(inv.customization?.fontFamily),
    }"
  >
    <!-- ==================== HERO ==================== -->
    <section
      id="hero-section"
      class="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-5 py-[60px]"
      :style="{ backgroundImage: `url('${coverImage}')` }"
    >
      <div class="w-full max-w-[680px]">
        <div class="mx-auto w-full rounded-[24px] border border-white/70 bg-white/[0.88] px-5 py-[35px] text-center shadow-[0_20px_40px_rgba(43,62,85,0.12)] backdrop-blur-md sm:px-[30px] sm:py-[45px]">
          <p class="mb-3 font-['Montserrat'] text-[0.85rem] uppercase tracking-[3px] text-[#6c7e93]">
            <TemplateEditable field="heroIntro" :value="heroIntro" as="span" placeholder="Together With Their Families" />
          </p>

          <h1 class="mb-[15px] block font-['Great_Vibes'] text-[clamp(3.2rem,8cqw,5.2rem)] leading-[1.1] text-[#3b4d66]">
            {{ coupleNames }}
          </h1>

          <p class="mb-[30px] block text-[1.15rem] italic text-[#4a5d73]">
            <TemplateEditable field="heroTagline" :value="heroTagline" as="span" placeholder="joyfully invite you to celebrate their wedding day" />
          </p>

          <!-- Dashed gold border info container -->
          <div class="mb-[35px] flex flex-col justify-center gap-3 rounded-2xl border border-dashed border-[#c5a059]/40 bg-[#f4f8fb]/70 p-5 sm:flex-row sm:flex-wrap sm:gap-5">
            <div class="flex items-center gap-2.5 font-medium text-[#3b4d66]">
              <CalendarDays class="h-[22px] w-[22px] shrink-0 text-[#c5a059]" />
              <span class="text-[1rem]">
                <TemplateEditable field="weddingDate" :value="weddingDateDisplay" as="span" placeholder="Saturday, June 17, 2028" />
              </span>
            </div>
            <div class="flex items-center gap-2.5 font-medium text-[#3b4d66]">
              <Clock3 class="h-[22px] w-[22px] shrink-0 text-[#c5a059]" />
              <span class="text-[1rem]">
                <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '4:00 PM'" as="span" placeholder="4:00 PM" />
              </span>
            </div>
            <div class="flex items-center gap-2.5 font-medium text-[#3b4d66]">
              <MapPin class="h-[22px] w-[22px] shrink-0 text-[#c5a059]" />
              <span class="text-[1rem]">
                <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== COUNTDOWN ==================== -->
    <section id="countdown" class="bg-gradient-to-b from-white to-[#f4f8fb] px-5 py-[90px] text-center">
      <div class="mx-auto w-full max-w-[1200px]">
        <span class="mb-2 inline-block font-['Montserrat'] text-[0.8rem] font-semibold uppercase tracking-[2px] text-[#c5a059]">
          <TemplateEditable field="countdownBadge" :value="countdownBadge" as="span" placeholder="Build Excitement" />
        </span>
        <h2 class="mb-3 block font-['Great_Vibes'] text-[2.8rem] font-medium text-[#3b4d66] sm:text-[3.5rem]">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Counting Down to the Big Day" />
        </h2>
        <p class="mx-auto mb-10 block max-w-[600px] text-[1.1rem] text-[#6c7e93]">
          <TemplateEditable field="countdownText" :value="countdownText" as="span" placeholder="Every second brings us closer to celebrating our love together with you!" multiline />
        </p>

        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </div>
    </section>

    <!-- ==================== SAVE TO CALENDAR ==================== -->
    <section id="calendar" class="bg-white px-5 py-20">
      <div class="mx-auto max-w-[800px] rounded-[20px] border border-[#3b4d66]/10 bg-[#f4f8fb] px-5 py-10 text-center shadow-[0_12px_32px_rgba(59,77,102,0.08)] sm:px-[30px]">
        <span class="mb-2 inline-block font-['Montserrat'] text-[0.8rem] font-semibold uppercase tracking-[2px] text-[#c5a059]">
          <TemplateEditable field="saveTheDateBadge" :value="saveTheDateBadge" as="span" placeholder="Save to Calendar" />
        </span>
        <h2 class="mb-3 block font-['Great_Vibes'] text-[2.7rem] font-medium text-[#3b4d66] sm:text-[3rem]">
          <TemplateEditable field="saveTheDateTitle" :value="saveTheDateTitle" as="span" placeholder="Don't Miss the Celebration" />
        </h2>
        <p class="mx-auto mb-[25px] block max-w-[600px] text-[1.1rem] text-[#6c7e93]">
          <TemplateEditable field="saveTheDateText" :value="saveTheDateText" as="span" placeholder="Instantly add the wedding to your personal calendar" multiline />
        </p>
        <div class="flex flex-wrap justify-center gap-[15px]">
          <a
            :href="googleCalendarUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-[#c5a059] px-[26px] py-3 font-['Montserrat'] text-[0.9rem] font-semibold tracking-[0.5px] text-white shadow-[0_4px_15px_rgba(197,160,89,0.3)] transition hover:bg-[#b08c46] hover:shadow-[0_6px_20px_rgba(197,160,89,0.4)] active:scale-[0.98]"
          >
            <CalendarDays :size="18" />
            <TemplateEditable field="saveTheDateButton" :value="saveTheDateButton" as="span" placeholder="Save the date" />
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== VENUE ==================== -->
    <section id="location" class="bg-[#f4f8fb] px-5 py-[90px]">
      <h2 class="mb-3 block text-center font-['Great_Vibes'] text-[2.8rem] font-medium text-[#3b4d66] sm:text-[3.5rem]">
        <TemplateEditable field="venueSectionTitle" :value="venueSectionTitle" as="span" placeholder="Venue & Directions" />
      </h2>
      <p class="mx-auto mb-10 block max-w-[600px] text-center text-[1.1rem] text-[#6c7e93]">
        <TemplateEditable field="venueSectionText" :value="venueSectionText" as="span" placeholder="We can't wait to welcome you to our wedding venue" />
      </p>

      <div class="mx-auto grid max-w-[950px] overflow-hidden rounded-[24px] bg-white shadow-[0_12px_32px_rgba(59,77,102,0.08)] md:grid-cols-[1fr_1.2fr]">
        <div class="flex flex-col justify-center px-5 py-10 sm:px-[30px]">
          <span class="mb-2 inline-block font-['Montserrat'] text-[0.8rem] font-semibold uppercase tracking-[2px] text-[#c5a059]">
            <TemplateEditable field="locationDetailsTitle" :value="locationDetailsTitle" as="span" placeholder="Location Details" />
          </span>
          <h3 class="mb-[15px] block text-[1.8rem] font-medium text-[#3b4d66]">
            <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
          </h3>

          <div class="mb-[15px] flex items-start gap-3 text-[#4a5d73]">
            <MapPin class="mt-0.5 h-[21px] w-[21px] shrink-0 text-[#c5a059]" />
            <div>
              <strong class="block">
                <TemplateEditable field="addressLabel" :value="addressLabel" as="span" placeholder="Address:" />
              </strong>
              <span class="block">
                <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" />
              </span>
            </div>
          </div>

          <div class="mb-[15px] flex items-start gap-3 text-[#4a5d73]">
            <Clock3 class="mt-0.5 h-[21px] w-[21px] shrink-0 text-[#c5a059]" />
            <div>
              <strong class="block">
                <TemplateEditable field="ceremonyLabel" :value="ceremonyLabel" as="span" placeholder="Ceremony Start:" />
              </strong>
              <span class="block">
                {{ weddingDateDisplay }} at {{ inv.events?.[0]?.startTime || '4:00 PM' }}
              </span>
            </div>
          </div>

          <div class="mb-[25px] flex items-start gap-3 text-[#4a5d73]">
            <Navigation class="mt-0.5 h-[21px] w-[21px] shrink-0 text-[#c5a059]" />
            <div>
              <strong class="block">
                <TemplateEditable field="parkingLabel" :value="parkingLabel" as="span" placeholder="Guest Parking:" />
              </strong>
              <span class="block">
                <TemplateEditable field="parkingText" :value="parkingText" as="span" placeholder="Complimentary valet parking available" multiline />
              </span>
            </div>
          </div>

          <a
            :href="googleMapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex w-fit items-center justify-center gap-2 self-start rounded-full bg-[#c5a059] px-[26px] py-3 font-['Montserrat'] text-[0.9rem] font-semibold tracking-[0.5px] text-white shadow-[0_4px_15px_rgba(197,160,89,0.3)] transition hover:bg-[#b08c46] active:scale-[0.98]"
          >
            <MapPin :size="18" />
            <TemplateEditable field="directionsButton" :value="directionsButton" as="span" placeholder="Get Directions in Google Maps" />
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== CELEBRATIONS ==================== -->
    <TemplateCelebrations :show-events="showEvents" theme="navy" />

    <!-- ==================== COUPLE PHOTO ==================== -->
    <TemplateCouplePhoto
      :photo-url="couplePhoto"
      :groom-name="groomName"
      :bride-name="brideName"
      :show-photo-section="showPhotoSection"
      theme="navy"
    />

    <!-- ==================== RSVP ==================== -->
    <TemplateRsvp v-if="inv.rsvp?.enabled"       :groom-name="groomName"
      :bride-name="brideName"
      :whatsapp-number="whatsappNumber"
      theme="navy"
    />

    <!-- ==================== FOOTER ==================== -->
    <footer class="bg-[#3b4d66] px-5 py-10 text-center text-[0.9rem] text-white/80">
      <h3 class="mb-2 block font-['Great_Vibes'] text-[2.5rem] text-white">
        {{ coupleNames }}
      </h3>
      <p class="block">{{ weddingDateShort }} &bull; {{ venueName }}</p>
      <p class="mt-2.5 block text-[0.8rem] opacity-60">
        <TemplateEditable field="footerMessage" :value="footerMessage" as="span" placeholder="We look forward to seeing you!" />
      </p>
    </footer>
  </main>
</template>
