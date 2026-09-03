<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl } from '@vowly/utils'
import { MapPin, Sparkles } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('royal-postcard')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Hamza')
const brideName = computed(() => inv.value.brideName || 'Ayesha')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-21')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const heroTagline = computed(() => inv.value.customization.text.heroTagline || 'Together With Their Families')
const invitationText = computed(() => inv.value.customization.text.invitationText || 'REQUEST THE HONOR OF YOUR PRESENCE\nAT THEIR WEDDING')
const weddingDay = computed(() => inv.value.customization.text.weddingDay || 'SUNDAY')
const weddingMonth = computed(() => inv.value.customization.text.weddingMonth || 'DECEMBER')
const weddingDayNum = computed(() => inv.value.customization.text.weddingDayNum || '21')
const weddingYear = computed(() => inv.value.customization.text.weddingYear || '2026')
const weddingTime = computed(() => inv.value.customization.text.weddingTime || 'AT 05:30 PM')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'The Raviz Kadavu')
const venueAddress = computed(() => inv.value.events?.[0]?.address || 'BYPASS ROAD, CALICUT (KOZHIKODE),\nMALABAR, KERALA')
const venueMapTitle = computed(() => inv.value.customization.text.venueMapTitle || 'THE RAVIZ KADAVU RESORT')
const venueMapAddress = computed(() => inv.value.customization.text.venueMapAddress || 'NH 66, Bypass Road, Calicut (Kozhikode), Kerala 673633')
const findUsButtonText = computed(() => inv.value.customization.text.findUsButtonText || 'Open in Google Maps')
const coupleSectionTitle = computed(() => inv.value.customization.text.coupleSectionTitle || 'Meet the Couple')
const coupleSectionDivider = computed(() => inv.value.customization.text.coupleSectionDivider || '— ❀ —')
const brideRole = computed(() => inv.value.customization.text.brideRole || 'The Bride')
const brideDescription = computed(() => inv.value.customization.text.brideDescription || 'Daughter of Mr. & Mrs. Rahman, bringing grace, warmth, and timeless traditions from the heart of Malabar into this beautiful union.')
const groomRole = computed(() => inv.value.customization.text.groomRole || 'The Groom')
const groomDescription = computed(() => inv.value.customization.text.groomDescription || 'Son of Mr. & Mrs. Abdullah, stepping forward with devotion and joy to begin a lifelong journey shared in love and companionship.')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'The Countdown')
const countdownSubtitle = computed(() => inv.value.customization.text.countdownSubtitle || 'Counting every moment until our big day')
const phone = computed(() => inv.value.customization.text.phone || '+91 98460 12345')
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')

const googleMapUrl = computed(() => {
  const url = inv.value.events?.[0]?.googleMapUrl
  if (url) return googleMapsOpenUrl(url)
  return googleMapsOpenUrl(`${venueName.value} ${venueMapAddress.value}`)
})

provide('invitation', inv)
</script>

<template>
  <div
    class="min-h-screen bg-[#FDFBF7] text-[#3A322D] flex justify-center p-[15px_10px] overflow-x-hidden relative select-auto font-serif text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      fontFamily: `ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif`,
    }"
  >
    <main class="w-full max-w-[460px] bg-[#FDFBF7] relative overflow-hidden">
      <!-- ==================== HERO POSTCARD ==================== -->
      <section
        id="hero-section"
        class="bg-[#F5EBE0] border-[1.5px] border-[#CBAE82] rounded-[18px] p-[35px_20px_25px] text-center relative shadow-[0_12px_30px_rgba(110,26,36,0.1)] mb-10 overflow-hidden"
      >
        <!-- Inner border via CSS -->
        <div class="absolute inset-[10px] border border-[#D4B28C] rounded-[14px] pointer-events-none" />

        <!-- Top Ornament -->
        <div class="text-[#B58D57] text-[1.4rem] tracking-[4px] mb-2.5 animate-pulse select-none">
          ❀ ❖ ❀
        </div>

        <!-- Tagline -->
        <div class="text-[0.68rem] tracking-[2.5px] text-[#3A322D] uppercase mb-3">
          <TemplateEditable field="heroTagline" :value="heroTagline" as="span" placeholder="Together With Their Families" />
        </div>

        <!-- Bride Name -->
        <h1 class="font-[Alex_Brush] text-[3.8rem] text-[#6E1A24] leading-none my-1 font-normal">
          <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Ayesha" />
        </h1>

        <!-- And Text -->
        <div class="italic text-[#B58D57] text-[1.3rem] relative inline-block my-0.5 before:content-['—'] before:mx-2 before:text-[#D4B28C] after:content-['—'] after:mx-2 after:text-[#D4B28C]">
          and
        </div>

        <!-- Groom Name -->
        <h1 class="font-[Alex_Brush] text-[3.8rem] text-[#6E1A24] leading-none my-1 font-normal">
          <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Hamza" />
        </h1>

        <!-- Invitation Text -->
        <div class="text-[0.7rem] tracking-[1.8px] text-[#3A322D] my-[18px] leading-[1.6] whitespace-pre-line">
          <TemplateEditable field="invitationText" :value="invitationText" as="span" multiline placeholder="REQUEST THE HONOR OF YOUR PRESENCE AT THEIR WEDDING" />
        </div>

        <!-- Date Display Box -->
        <div class="my-[22px]">
          <p class="text-[0.82rem] tracking-[3px] text-[#3A322D] mb-1.5">
            <TemplateEditable field="weddingDay" :value="weddingDay" as="span" placeholder="SUNDAY" />
          </p>
          <div class="flex justify-center items-center gap-[15px] border-t border-b border-[#D4B28C] py-2 max-w-[270px] mx-auto">
            <span class="text-[0.8rem] tracking-[2px] text-[#3A322D]">
              <TemplateEditable field="weddingMonth" :value="weddingMonth" as="span" placeholder="DECEMBER" />
            </span>
            <span class="text-[2.7rem] text-[#6E1A24] leading-none font-semibold">
              <TemplateEditable field="weddingDayNum" :value="weddingDayNum" as="span" placeholder="21" />
            </span>
            <span class="text-[0.8rem] tracking-[2px] text-[#3A322D]">
              <TemplateEditable field="weddingYear" :value="weddingYear" as="span" placeholder="2026" />
            </span>
          </div>
          <p class="text-[0.78rem] tracking-[2px] text-[#3A322D] mt-3">
            <TemplateEditable field="weddingTime" :value="weddingTime" as="span" placeholder="AT 05:30 PM" />
          </p>
        </div>

        <!-- Venue & Location -->
        <div class="mt-4">
          <div class="text-[#B58D57] text-[1rem] mb-1">❖</div>
          <h2 class="font-[Alex_Brush] text-[2.4rem] text-[#6E1A24] mt-2.5">
            <TemplateEditable field="venueName" :value="venueName" as="span" placeholder="The Raviz Kadavu" />
          </h2>
          <div class="text-[0.68rem] tracking-[1.5px] text-[#3A322D] leading-[1.6] mt-1 whitespace-pre-line">
            <TemplateEditable field="venueAddress" :value="venueAddress" as="span" multiline placeholder="BYPASS ROAD, CALICUT (KOZHIKODE), MALABAR, KERALA" />
          </div>
        </div>

        <!-- Bride & Groom SVG Illustration -->
        <div class="my-[20px] mx-auto w-[175px] h-[175px] flex justify-center items-center animate-float-slow [filter:drop-shadow(0_8px_15px_rgba(110,26,36,0.15))]" aria-label="Bride and Groom Traditional Illustration">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
            <circle cx="100" cy="100" r="85" fill="#F0E2D0" opacity="0.6" />
            <circle cx="100" cy="100" r="75" stroke="#D4B28C" stroke-width="1" stroke-dasharray="4 4" />
            <path d="M110 80 C110 65 130 65 130 80 L145 170 L100 170 Z" fill="#231F20" />
            <path d="M118 80 L118 130" stroke="#B58D57" stroke-width="1.5" />
            <circle cx="120" cy="55" r="14" fill="#E5C29F" />
            <path d="M106 53 C106 40 134 40 134 53 Z" fill="#1A1A1A" />
            <path d="M55 170 C65 110 85 85 95 80 L110 170 Z" fill="#6E1A24" />
            <path d="M50 170 C60 100 85 65 95 65 L105 170 Z" fill="#88202D" opacity="0.85" />
            <path d="M55 160 Q80 155 108 160" stroke="#B58D57" stroke-width="2" fill="none" />
            <path d="M60 145 Q80 140 105 145" stroke="#B58D57" stroke-width="1.5" stroke-dasharray="3 3" fill="none" />
            <circle cx="85" cy="58" r="13" fill="#E5C29F" />
            <path d="M72 58 C72 42 98 42 98 58 C98 70 75 70 72 58 Z" fill="#6E1A24" />
            <path d="M72 58 Q85 40 98 58" stroke="#B58D57" stroke-width="1.5" fill="none" />
            <circle cx="105" cy="105" r="4" fill="#D4B28C" />
          </svg>
        </div>

        <!-- Quick RSVP Button -->
        <a href="#rsvp-section" class="block mt-5 text-[0.72rem] tracking-[2px] text-[#3A322D] no-underline hover:opacity-90 transition-opacity">
          RSVP NOW
          <span class="block text-[#6E1A24] font-bold mt-[3px]">
            <TemplateEditable field="phone" :value="phone" as="span" placeholder="+91 98460 12345" />
          </span>
        </a>
      </section>

      <!-- ==================== BRIDE & GROOM DETAILS ==================== -->
      <section class="p-[35px_10px] text-center">
        <h2 class="text-[2.3rem] text-[#6E1A24] font-semibold mb-1">
          <TemplateEditable field="coupleSectionTitle" :value="coupleSectionTitle" as="span" placeholder="Meet the Couple" />
        </h2>
        <div class="text-[#B58D57] text-[1.2rem] mb-[25px] animate-pulse">
          <TemplateEditable field="coupleSectionDivider" :value="coupleSectionDivider" as="span" placeholder="— ❀ —" />
        </div>

        <div class="flex flex-col gap-5">
          <!-- Bride Card -->
          <div class="bg-[#F5EBE0] border border-[#CBAE82] rounded-[14px] p-[25px_20px] text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(110,26,36,0.08)] transition-all duration-300">
            <h3 class="text-[1.15rem] tracking-[2.5px] text-[#6E1A24] mb-1.5 uppercase font-semibold">
              <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="AYESHA" />
            </h3>
            <p class="italic text-[#B58D57] text-[1.15rem] mb-3">
              <TemplateEditable field="brideRole" :value="brideRole" as="span" placeholder="The Bride" />
            </p>
            <p class="text-[0.98rem] text-[#3A322D] leading-[1.6]">
              <TemplateEditable field="brideDescription" :value="brideDescription" as="span" multiline placeholder="Daughter of Mr. & Mrs. Rahman, bringing grace, warmth, and timeless traditions from the heart of Malabar into this beautiful union." />
            </p>
          </div>

          <!-- Groom Card -->
          <div class="bg-[#F5EBE0] border border-[#CBAE82] rounded-[14px] p-[25px_20px] text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(110,26,36,0.08)] transition-all duration-300">
            <h3 class="text-[1.15rem] tracking-[2.5px] text-[#6E1A24] mb-1.5 uppercase font-semibold">
              <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="HAMZA" />
            </h3>
            <p class="italic text-[#B58D57] text-[1.15rem] mb-3">
              <TemplateEditable field="groomRole" :value="groomRole" as="span" placeholder="The Groom" />
            </p>
            <p class="text-[0.98rem] text-[#3A322D] leading-[1.6]">
              <TemplateEditable field="groomDescription" :value="groomDescription" as="span" multiline placeholder="Son of Mr. & Mrs. Abdullah, stepping forward with devotion and joy to begin a lifelong journey shared in love and companionship." />
            </p>
          </div>
        </div>
      </section>

      <!-- ==================== COUNTDOWN ==================== -->
      <section class="bg-[#F5EBE0] border border-[#CBAE82] rounded-[18px] p-[30px_15px] my-[25px] mb-10 shadow-[0_8px_22px_rgba(110,26,36,0.06)] text-center">
        <h2 class="text-[2.3rem] text-[#6E1A24] font-semibold mb-1">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="The Countdown" />
        </h2>
        <div class="text-[#B58D57] text-[1.1rem] mb-2 animate-pulse select-none">❖</div>
        <p class="text-[0.98rem] text-[#3A322D]">
          <TemplateEditable field="countdownSubtitle" :value="countdownSubtitle" as="span" placeholder="Counting every moment until our big day" />
        </p>
        <div class="mt-[22px]">
          <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
        </div>
      </section>

      <!-- ==================== FIND US (MAP) ==================== -->
      <section class="p-[35px_10px] text-center">
        <h2 class="text-[2.3rem] text-[#6E1A24] font-semibold mb-1">Find Us</h2>
        <div class="text-[#B58D57] text-[1.2rem] mb-[25px] animate-pulse">— ❀ —</div>

        <div class="bg-[#F5EBE0] border border-[#CBAE82] rounded-[18px] p-[22px] overflow-hidden mb-[30px] shadow-[0_8px_22px_rgba(110,26,36,0.06)]">
          <p class="text-[0.72rem] tracking-[1.5px] text-[#3A322D] font-bold mb-1 uppercase">
            <TemplateEditable field="venueMapTitle" :value="venueMapTitle" as="span" placeholder="THE RAVIZ KADAVU RESORT" />
          </p>
          <p class="text-[0.68rem] tracking-[1.5px] text-[#3A322D] mb-4 leading-[1.6]">
            <TemplateEditable field="venueMapAddress" :value="venueMapAddress" as="span" multiline placeholder="NH 66, Bypass Road, Calicut (Kozhikode), Kerala 673633" />
          </p>
          <a
            :href="googleMapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 mt-2 px-[26px] py-[13px] bg-[#6E1A24] hover:bg-[#4A1017] text-white text-[0.72rem] tracking-[2px] rounded-full transition-all duration-300 shadow-[0_4px_12px_rgba(110,26,36,0.3)] hover:-translate-y-0.5 active:translate-y-0 no-underline"
          >
            <MapPin class="w-3.5 h-3.5" />
            <TemplateEditable field="findUsButtonText" :value="findUsButtonText" as="span" placeholder="Open in Google Maps" />
          </a>
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
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="light"
      />

      <!-- ==================== FOOTER ==================== -->
      <footer class="text-center p-[25px_0_15px] font-[Alex_Brush] text-[2rem] text-[#6E1A24]">
        <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Ayesha" />
        {" "}&{" "}
        <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Hamza" />
      </footer>
    </main>
  </div>
</template>

<style scoped>
@keyframes pulseGold {
  0%, 100% { opacity: 0.65; }
  50% { opacity: 1; }
}
.animate-pulse {
  animation: pulseGold 3.5s infinite ease-in-out;
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
.animate-float-slow {
  animation: floatSlow 4s ease-in-out infinite;
}
</style>
