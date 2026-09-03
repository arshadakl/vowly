<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl, fontIdToCss } from '@vowly/utils'
import { Calendar, MapPin, Clock, Sparkles, ExternalLink } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('premium-floral')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'ADITYA')
const brideName = computed(() => inv.value.brideName || 'ANANYA')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-19')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroEyebrow = computed(() => inv.value.customization.text.heroEyebrow || "You're invited to the Haldi & Wedding Ceremony")
const heroIntro = computed(() => inv.value.customization.text.heroIntro || 'in honor of')
const weddingDay = computed(() => inv.value.customization.text.weddingDay || 'Saturday')
const weddingTimeDisplay = computed(() => inv.value.customization.text.weddingTime || '3:00 PM EST')
const setting = computed(() => inv.value.customization.text.setting || 'By the Pool')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'The Lyle Hotel')
const venueAddress = computed(() => inv.value.events?.[0]?.address || '1731 New Hampshire Ave NW, Washington, DC 20009')
const countdownSubtitle = computed(() => inv.value.customization.text.countdownSubtitle || 'Interactive Countdown Timer')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Build excitement for the big day')
const locationSubtitle = computed(() => inv.value.customization.text.locationSubtitle || 'Google Maps Navigation')
const locationTitle = computed(() => inv.value.customization.text.locationTitle || 'One-click directions to the venue')
const calendarSubtitle = computed(() => inv.value.customization.text.calendarSubtitle || 'Save to Calendar')
const calendarTitle = computed(() => inv.value.customization.text.calendarTitle || 'Guests can instantly add to Google Calendar')
const calendarDescription = computed(() => inv.value.customization.text.calendarDescription || 'Never miss a moment of our celebration. Save the date directly to your digital calendar!')
const footerTagline = computed(() => inv.value.customization.text.footerTagline || 'Crafted with love for our friends & family')
const heroBgImage = computed(() => inv.value.coverImage || def.backgroundImage)
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')

const googleMapUrl = computed(() => {
  const url = inv.value.events?.[0]?.googleMapUrl
  if (url) return url
  return googleMapsOpenUrl(`${venueName.value} ${venueAddress.value}`)
})

const calendarUrl = computed(() => {
  const title = encodeURIComponent(`${groomName.value} & ${brideName.value}'s Wedding`)
  const details = encodeURIComponent(`Join us for the celebration in honor of ${groomName.value} and ${brideName.value}!`)
  const location = encodeURIComponent(`${venueName.value}, ${venueAddress.value}`)
  const dateStr = weddingDate.value.replace(/-/g, '')
  const startTime = (inv.value.events?.[0]?.startTime || '19:00').replace(':', '') + '00'
  const endTime = (inv.value.events?.[0]?.endTime || '23:00').replace(':', '') + '00'
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}T${startTime}Z/${dateStr}T${endTime}Z&details=${details}&location=${location}`
})

provide('invitation', inv)
</script>

<template>
  <div
    class="max-w-md mx-auto w-full min-h-screen bg-[#e8dfd2] text-[#332f2b] font-[Montserrat] relative overflow-x-hidden shadow-2xl text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      fontFamily: fontIdToCss(inv.customization?.fontFamily),
    }"
  >
    <!-- ==================== HERO SECTION ==================== -->
    <section
      id="hero-section"
      class="min-h-screen relative grid place-items-center overflow-hidden pt-12 pb-16 px-4 border-b border-[#425c4c]/15"
      :style="{
        background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.85) 0%, rgba(247, 241, 231, 0.75) 50%, rgba(24, 60, 54, 0.3) 100%), url('${heroBgImage}') center/cover no-repeat`
      }"
    >
      <!-- Double Inner Borders -->
      <div class="absolute inset-3 border border-[#60584b]/20 pointer-events-none z-[1]" />
      <div class="absolute inset-6 border border-[#60584b]/10 pointer-events-none z-[1]" />

      <!-- Ornate Corner SVGs -->
      <div class="absolute inset-0 pointer-events-none z-[2]">
        <!-- Top Left -->
        <div class="absolute top-0 left-0 w-24 h-24 opacity-60">
          <svg viewBox="0 0 220 220" class="w-full h-full">
            <path d="M0 0h220v8H36C20 8 8 20 8 36v184H0z" fill="#173a34" />
            <path d="M0 20h200v7H38c-7 0-11 4-11 11v172h-7V38C20 28 28 20 38 20z" fill="#b7a78c" opacity=".75" />
            <path d="M36 9c28 17 54 20 85 7 21-9 42-11 64-6-26 19-53 26-80 20-25-5-47-11-69-3z" fill="#426b58" />
          </svg>
        </div>
        <!-- Top Right -->
        <div class="absolute top-0 right-0 w-24 h-24 opacity-60 scale-x-[-1]">
          <svg viewBox="0 0 220 220" class="w-full h-full">
            <path d="M0 0h220v8H36C20 8 8 20 8 36v184H0z" fill="#173a34" />
            <path d="M0 20h200v7H38c-7 0-11 4-11 11v172h-7V38C20 28 28 20 38 20z" fill="#b7a78c" opacity=".75" />
            <path d="M36 9c28 17 54 20 85 7 21-9 42-11 64-6-26 19-53 26-80 20-25-5-47-11-69-3z" fill="#426b58" />
          </svg>
        </div>
        <!-- Bottom Left -->
        <div class="absolute bottom-0 left-0 w-24 h-24 opacity-60 scale-y-[-1]">
          <svg viewBox="0 0 220 220" class="w-full h-full">
            <path d="M0 0h220v8H36C20 8 8 20 8 36v184H0z" fill="#173a34" />
            <path d="M0 20h200v7H38c-7 0-11 4-11 11v172h-7V38C20 28 28 20 38 20z" fill="#b7a78c" opacity=".75" />
            <path d="M36 9c28 17 54 20 85 7 21-9 42-11 64-6-26 19-53 26-80 20-25-5-47-11-69-3z" fill="#426b58" />
          </svg>
        </div>
        <!-- Bottom Right -->
        <div class="absolute bottom-0 right-0 w-24 h-24 opacity-60 scale-[-1]">
          <svg viewBox="0 0 220 220" class="w-full h-full">
            <path d="M0 0h220v8H36C20 8 8 20 8 36v184H0z" fill="#173a34" />
            <path d="M0 20h200v7H38c-7 0-11 4-11 11v172h-7V38C20 28 28 20 38 20z" fill="#b7a78c" opacity=".75" />
            <path d="M36 9c28 17 54 20 85 7 21-9 42-11 64-6-26 19-53 26-80 20-25-5-47-11-69-3z" fill="#426b58" />
          </svg>
        </div>
      </div>

      <!-- Floating Botanical Leaves -->
      <div class="botanical-leaf left-[-10px] bottom-4 w-28 opacity-30 pointer-events-none z-0">
        <svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 250C56 203 83 157 121 111c26-32 53-61 88-88" stroke="#526653" stroke-width="3" fill="none" />
          <g fill="#65785e">
            <ellipse cx="50" cy="211" rx="10" ry="28" transform="rotate(-34 50 211)" />
            <ellipse cx="71" cy="184" rx="10" ry="27" transform="rotate(25 71 184)" />
            <ellipse cx="99" cy="147" rx="10" ry="28" transform="rotate(32 99 147)" />
            <ellipse cx="130" cy="111" rx="10" ry="27" transform="rotate(35 130 111)" />
          </g>
        </svg>
      </div>
      <div class="botanical-leaf-right right-[-8px] top-10 w-28 opacity-30 pointer-events-none z-0 scale-x-[-1]" style="animation-delay: 0.5s;">
        <svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
          <path d="M25 250C56 203 83 157 121 111c26-32 53-61 88-88" stroke="#526653" stroke-width="3" fill="none" />
          <g fill="#65785e">
            <ellipse cx="50" cy="211" rx="10" ry="28" transform="rotate(-34 50 211)" />
            <ellipse cx="71" cy="184" rx="10" ry="27" transform="rotate(25 71 184)" />
            <ellipse cx="99" cy="147" rx="10" ry="28" transform="rotate(32 99 147)" />
            <ellipse cx="130" cy="111" rx="10" ry="27" transform="rotate(35 130 111)" />
          </g>
        </svg>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 text-center w-full px-2 py-6 flex flex-col items-center">
        <div class="text-[10px] tracking-[0.2em] uppercase text-[#3d3a36] font-medium leading-relaxed max-w-[280px]">
          <TemplateEditable field="heroEyebrow" :value="heroEyebrow" as="span" />
        </div>

        <div class="font-[Allura] text-2xl text-[#4b4944] mt-3">
          <TemplateEditable field="heroIntro" :value="heroIntro" as="span" />
        </div>

        <h1 class="font-['Cormorant_Garamond',_serif] text-4xl sm:text-5xl font-medium tracking-widest text-[#6a594f] uppercase mt-2">
          <TemplateEditable field="groomName" :value="groomName" as="span" />
        </h1>

        <div class="font-[Allura] text-3xl text-[#68635d] my-1">and</div>

        <h1 class="font-['Cormorant_Garamond',_serif] text-4xl sm:text-5xl font-medium tracking-widest text-[#6a594f] uppercase">
          <TemplateEditable field="brideName" :value="brideName" as="span" />
        </h1>

        <div class="font-[Allura] text-2xl text-[#4e4b46] mt-4">
          <TemplateEditable field="weddingDay" :value="weddingDay" as="span" />
        </div>

        <div class="mt-3 flex flex-col items-center gap-1 text-[11px] font-medium tracking-[0.14em] uppercase text-[#4e4b46]">
          <strong class="font-['Cormorant_Garamond',_serif] text-xl font-medium tracking-wider text-[#183c36]">
            <TemplateEditable field="weddingDate" :value="inv.customization.text.weddingDate || 'December 19, 2026'" as="span" />
          </strong>
          <span>
            <TemplateEditable field="weddingTime" :value="weddingTimeDisplay" as="span" />
          </span>
          <span class="opacity-90">
            <TemplateEditable field="setting" :value="setting" as="span" /> · <TemplateEditable field="venue" :value="venueName" as="span" />
          </span>
        </div>
      </div>

      <!-- Scroll Cue -->
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] text-[#425c4c] font-medium">
        <span>Scroll</span>
        <span class="scroll-line w-[1px] h-7 bg-[#425c4c] origin-top" />
      </div>
    </section>

    <!-- ==================== EVENT DETAILS SUMMARY GRID ==================== -->
    <section class="py-12 px-4 bg-[#e8dfd2]">
      <div class="bg-white/70 border border-[#425c4c]/20 rounded-xl p-6 shadow-[0_18px_55px_rgba(63,54,43,0.08)] backdrop-blur-md">
        <div class="grid grid-cols-2 gap-4 text-center">
          <div class="pb-3 border-b border-r border-[#425c4c]/15">
            <div class="text-[10px] font-semibold tracking-[0.2em] text-[#425c4c] uppercase mb-1 flex items-center justify-center gap-1">
              <Calendar class="w-3 h-3" /> Date
            </div>
            <div class="text-lg font-medium text-[#332f2b]">
              <TemplateEditable field="weddingDate" :value="inv.customization.text.weddingDate || 'December 19, 2026'" as="span" />
            </div>
          </div>
          <div class="pb-3 border-b border-[#425c4c]/15">
            <div class="text-[10px] font-semibold tracking-[0.2em] text-[#425c4c] uppercase mb-1 flex items-center justify-center gap-1">
              <Clock class="w-3 h-3" /> Time
            </div>
            <div class="text-lg font-medium text-[#332f2b]">
              <TemplateEditable field="weddingTime" :value="weddingTimeDisplay" as="span" />
            </div>
          </div>
          <div class="pt-2 border-r border-[#425c4c]/15">
            <div class="text-[10px] font-semibold tracking-[0.2em] text-[#425c4c] uppercase mb-1 flex items-center justify-center gap-1">
              <Sparkles class="w-3 h-3" /> Setting
            </div>
            <div class="text-lg font-medium text-[#332f2b]">
              <TemplateEditable field="setting" :value="setting" as="span" />
            </div>
          </div>
          <div class="pt-2">
            <div class="text-[10px] font-semibold tracking-[0.2em] text-[#425c4c] uppercase mb-1 flex items-center justify-center gap-1">
              <MapPin class="w-3 h-3" /> Venue
            </div>
            <div class="text-lg font-medium text-[#332f2b]">
              <TemplateEditable field="venue" :value="venueName" as="span" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== COUNTDOWN ==================== -->
    <section class="py-14 px-4 bg-gradient-to-b from-[#f5f1ea] to-[#ece4d6]">
      <div class="text-center mb-8">
        <div class="text-[10px] font-semibold tracking-[0.25em] text-[#425c4c] uppercase mb-2">
          <TemplateEditable field="countdownSubtitle" :value="countdownSubtitle" as="span" />
        </div>
        <h2 class="font-['Cormorant_Garamond',_serif] text-3xl font-medium text-[#183c36]">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" />
        </h2>
        <p class="text-xs text-[#6e6b65] mt-2 max-w-xs mx-auto">
          Counting down every moment until {{ groomName }} and {{ brideName }} say "I Do"!
        </p>
        <div class="w-12 h-[2px] bg-[#c5a059] mx-auto mt-4 opacity-75" />
      </div>
      <div class="bg-white/80 border border-[#c5a059]/40 rounded-xl p-5 shadow-lg backdrop-blur-md">
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </div>
    </section>

    <!-- ==================== GOOGLE MAPS NAVIGATION ==================== -->
    <section class="py-14 px-4 bg-[#e8dfd2]">
      <div class="text-center mb-8">
        <div class="text-[10px] font-semibold tracking-[0.25em] text-[#425c4c] uppercase mb-2">
          <TemplateEditable field="locationSubtitle" :value="locationSubtitle" as="span" />
        </div>
        <h2 class="font-['Cormorant_Garamond',_serif] text-3xl font-medium text-[#183c36]">
          <TemplateEditable field="locationTitle" :value="locationTitle" as="span" />
        </h2>
        <p class="text-xs text-[#6e6b65] mt-2 max-w-xs mx-auto">
          Easily navigate to <TemplateEditable field="venue" :value="venueName" as="span" /> for the celebration.
        </p>
        <div class="w-12 h-[2px] bg-[#c5a059] mx-auto mt-4 opacity-75" />
      </div>
      <div class="bg-white/80 border border-[#425c4c]/20 rounded-xl overflow-hidden shadow-lg backdrop-blur-md">
        <div class="p-5 border-b border-[#425c4c]/15 flex flex-col gap-3">
          <div>
            <h3 class="font-['Cormorant_Garamond',_serif] text-2xl font-semibold text-[#183c36]">
              <TemplateEditable field="venue" :value="venueName" as="span" />
            </h3>
            <p class="text-xs text-[#6e6b65] mt-1 flex items-start gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-[#425c4c] shrink-0 mt-0.5" />
              <TemplateEditable field="venueAddress" :value="venueAddress" as="span" />
            </p>
          </div>
        </div>
        <div class="p-4 bg-white/90 flex flex-col items-center">
          <a
            :href="googleMapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-3.5 px-4 rounded-md bg-[#183c36] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:bg-[#112c28] transition-colors"
          >
            <MapPin class="w-4 h-4" />
            Open Directions on Google Maps
            <ExternalLink class="w-3.5 h-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </section>

    <!-- ==================== SAVE TO CALENDAR ==================== -->
    <section class="py-14 px-4 bg-[#f7f1e7]">
      <div class="text-center mb-8">
        <div class="text-[10px] font-semibold tracking-[0.25em] text-[#425c4c] uppercase mb-2">
          <TemplateEditable field="calendarSubtitle" :value="calendarSubtitle" as="span" />
        </div>
        <h2 class="font-['Cormorant_Garamond',_serif] text-3xl font-medium text-[#183c36]">
          <TemplateEditable field="calendarTitle" :value="calendarTitle" as="span" />
        </h2>
        <p class="text-xs text-[#6e6b65] mt-2 max-w-xs mx-auto">
          <TemplateEditable field="calendarDescription" :value="calendarDescription" as="span" />
        </p>
        <div class="w-12 h-[2px] bg-[#c5a059] mx-auto mt-4 opacity-75" />
      </div>
      <div class="bg-white/80 border border-[#c5a059]/35 rounded-xl p-6 shadow-md backdrop-blur-md text-center">
        <a
          :href="calendarUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full py-4 px-6 rounded-lg bg-gradient-to-r from-[#183c36] to-[#2a524a] text-[#f3e6c8] text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-3 shadow-lg border border-[#c5a059]/40 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 no-underline"
        >
          <Calendar class="w-5 h-5 text-[#c5a059]" />
          Save Date to Calendar
        </a>
      </div>
    </section>

    <!-- ==================== SHARED SECTIONS ==================== -->
    <TemplateCelebrations :show-events="showEvents" theme="emerald" />
    <TemplateCouplePhoto
      :photo-url="couplePhoto"
      :groom-name="groomName"
      :bride-name="brideName"
      :show-photo-section="showPhotoSection"
      theme="emerald"
    />
    <TemplateRsvp v-if="inv.rsvp?.enabled"       :groom-name="groomName"
      :bride-name="brideName"
      :whatsapp-number="whatsappNumber"
      theme="emerald"
    />

    <!-- ==================== FOOTER ==================== -->
    <footer class="bg-[#183c36] text-[#ded6c9] text-center py-12 px-4 relative overflow-hidden border-t border-[#c5a059]/20">
      <div class="relative z-10 flex flex-col items-center">
        <span class="w-5 h-5 text-[#c5a059] mb-3">♥</span>
        <h3 class="font-[Allura] text-4xl text-[#f3e6c8] mb-2">
          {{ groomName }} & {{ brideName }}
        </h3>
        <p class="text-[11px] tracking-[0.2em] uppercase opacity-80 font-medium">
          <TemplateEditable field="weddingDate" :value="inv.customization.text.weddingDate || 'December 19, 2026'" as="span" /> · <TemplateEditable field="venue" :value="venueName" as="span" />
        </p>
        <p class="mt-4 text-[10px] opacity-50 font-light">
          <TemplateEditable field="footerTagline" :value="footerTagline" as="span" />
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes botanicalFloat {
  0%, 100% { transform: translateY(0px) rotate(-2deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
}
@keyframes botanicalFloatRight {
  0%, 100% { transform: translateY(0px) rotate(2deg); }
  50% { transform: translateY(-8px) rotate(-2deg); }
}
.botanical-leaf {
  position: absolute;
  animation: botanicalFloat 6s ease-in-out infinite;
}
.botanical-leaf-right {
  position: absolute;
  animation: botanicalFloatRight 7s ease-in-out infinite;
}
@keyframes scrollPulse {
  0%, 100% { transform: scaleY(0.35); opacity: 0.3; }
  50% { transform: scaleY(1); opacity: 1; }
}
.scroll-line {
  animation: scrollPulse 1.8s ease-in-out infinite;
}
</style>
