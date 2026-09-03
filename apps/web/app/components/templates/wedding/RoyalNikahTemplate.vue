<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl, fontIdToCss } from '@vowly/utils'
import { MapPin, Sparkles } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('royal-nikah')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'FAHAD')
const brideName = computed(() => inv.value.brideName || 'AYESHA')
const weddingDate = computed(() => inv.value.weddingDate || '2026-10-18')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')

const eyebrowMalayalam = computed(() => inv.value.customization.text.eyebrowMalayalam || 'വിവാഹ ക്ഷണം')
const eyebrowEnglish = computed(() => inv.value.customization.text.eyebrowEnglish || 'Royal Malabar Nikah')
const dateDisplay = computed(() => inv.value.customization.text.dateDisplay || 'October 18, 2026')
const locationDisplay = computed(() => inv.value.customization.text.locationDisplay || 'Kozhikode, Kerala')
const heroImage = computed(() => inv.value.coverImage || def.backgroundImage)
const sealText = computed(() => inv.value.customization.text.sealText || '• BLESSINGS • ALHAMDULILLAH ')
const venueTag = computed(() => inv.value.customization.text.venueTag || 'Royal Venue')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'The Raviz Kadavu')
const venueCity = computed(() => inv.value.customization.text.venueCity || 'Kozhikode (Calicut), Kerala')
const venueAddress = computed(() => inv.value.events?.[0]?.address || 'NH 66, Bypass Road, Azhinjilam, Kerala 673632.\nJoin us as we celebrate love, heritage, and togetherness.')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting Down To Forever')
const footerBlessing = computed(() => inv.value.customization.text.footerBlessing || 'With blessings from family & friends • Malabar, Kerala • October 2026')
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')

const googleMapUrl = computed(() => {
  const url = inv.value.events?.[0]?.googleMapUrl
  if (url) return url
  return googleMapsOpenUrl(`${venueName.value} ${venueCity.value} ${venueAddress.value}`)
})

const groomInitial = computed(() => groomName.value?.trim()?.charAt(0)?.toUpperCase() || 'F')
const brideInitial = computed(() => brideName.value?.trim()?.charAt(0)?.toUpperCase() || 'A')
const monogram = computed(() => `${groomInitial.value} & ${brideInitial.value}`)
const sealMonogram = computed(() => `${groomInitial.value}&${brideInitial.value}`)

provide('invitation', inv)
</script>

<template>
  <div
    class="relative min-h-screen overflow-x-clip bg-[#061412] text-[#F7F5F0] antialiased text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
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
      class="relative z-10 w-full overflow-hidden bg-[radial-gradient(circle_at_50%_15%,_#0B2420_0%,_#061412_58%,_#040D0B_100%)] px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:flex lg:min-h-screen lg:items-center lg:px-[6%] lg:py-16"
    >
      <div class="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 sm:gap-12 md:gap-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
        <!-- LEFT SIDE — NAMES -->
        <div class="flex w-full min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
          <!-- Eyebrow -->
          <div class="flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-start lg:gap-4">
            <span class="max-w-[45cqw] break-words font-[Amiri] text-[0.85rem] text-[#D4AF37] sm:text-[1rem] md:text-[1.1rem]">
              <TemplateEditable field="eyebrowMalayalam" :value="eyebrowMalayalam" as="span" placeholder="വിവാഹ ക്ഷണം" />
            </span>
            <div class="h-px w-5 shrink-0 bg-[#D4AF37]/60 sm:w-8 md:w-10" />
            <span class="max-w-[45cqw] break-words font-[Plus_Jakarta_Sans] text-[0.58rem] font-medium uppercase tracking-[2px] text-[#A3B8B5] sm:text-[0.65rem] sm:tracking-[3px] md:text-[0.75rem] md:tracking-[4px]">
              <TemplateEditable field="eyebrowEnglish" :value="eyebrowEnglish" as="span" placeholder="Royal Malabar Nikah" />
            </span>
          </div>

          <!-- Couple Names -->
          <div class="mt-6 flex w-full min-w-0 flex-col items-center lg:items-start">
            <h1 class="m-0 max-w-full break-words text-center font-semibold leading-[0.92] tracking-[-0.02em] text-[#F7F5F0] text-[clamp(2.2rem,11cqw,3.8rem)] lg:text-[clamp(2.5rem,10cqw,4.2rem)] lg:text-left">
              <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="GROOM" />
            </h1>

            <div class="my-2 font-[Amiri] italic text-[#F4E096] text-[1.8rem] sm:text-[2rem] md:text-[2.2rem] lg:ml-8">
              &amp;
            </div>

            <h1 class="m-0 max-w-full break-words text-center font-semibold leading-[0.92] tracking-[-0.02em] text-[#F7F5F0] text-[clamp(2.2rem,11cqw,3.8rem)] lg:text-[clamp(2.5rem,10cqw,4.2rem)] lg:text-left">
              <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="BRIDE" />
            </h1>
          </div>

          <!-- Date / Location -->
          <div class="mt-6 flex w-full max-w-[95cqw] flex-wrap items-center justify-center gap-x-2 gap-y-1 break-words font-[Plus_Jakarta_Sans] text-[0.62rem] font-normal uppercase tracking-[1.4px] text-[#A3B8B5] sm:text-[0.7rem] sm:tracking-[1.8px] md:text-[0.8rem] md:tracking-[2px] lg:justify-start">
            <span class="break-words">
              <TemplateEditable field="dateDisplay" :value="dateDisplay" as="span" placeholder="October 18, 2026" />
            </span>
            <span class="shrink-0">•</span>
            <span class="break-words">
              <TemplateEditable field="locationDisplay" :value="locationDisplay" as="span" placeholder="Kozhikode, Kerala" />
            </span>
          </div>
        </div>

        <!-- RIGHT SIDE — IMAGE -->
        <div class="relative flex w-full min-w-0 justify-center">
          <!-- Image Frame -->
          <div class="relative w-[min(88cqw,380px)] aspect-[0.76/1] rounded-t-[45%] rounded-b-[18px] bg-gradient-to-br from-[#D4AF37] via-[#8A6F1C] to-[#5C4812] p-[3px] shadow-[0_25px_50px_rgba(0,0,0,0.55)]">
            <div class="relative h-full w-full overflow-hidden rounded-t-[43%] rounded-b-[15px] bg-[#0B2420]">
              <img
                :src="heroImage"
                :alt="`${groomName} & ${brideName} Royal Nikah`"
                class="h-full w-full object-cover contrast-105 brightness-95 transition-transform duration-1000 ease-out lg:hover:scale-105"
                loading="eager"
              >
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#061412]/35 via-transparent to-[#D4AF37]/5" />
            </div>
          </div>

          <!-- Rotating Seal -->
          <div class="absolute bottom-[-22px] left-[calc(50%-43%)] z-20 flex aspect-square w-[82px] items-center justify-center rounded-full border border-[#D4AF37] bg-[#061412] shadow-[0_10px_25px_rgba(0,0,0,0.55)] sm:bottom-[-24px] sm:left-[calc(50%-38%)] sm:w-[94px] md:w-[104px] lg:bottom-[-22px] lg:left-[calc(50%-34%)] lg:w-[110px]">
            <svg
              class="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              aria-hidden="true"
              style="animation: sealRotate 16s linear infinite;"
            >
              <path
                id="circlePathVue"
                d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="none"
              />
              <text
                font-size="10"
                font-family="'Plus Jakarta Sans', sans-serif"
                font-weight="600"
                fill="#D4AF37"
                letter-spacing="1.5"
              >
                <textPath href="#circlePathVue">
                  {{ sealText }}
                </textPath>
              </text>
            </svg>
            <span class="relative z-10 select-none font-[Amiri] font-bold text-[#F4E096] text-[1rem] sm:text-[1.15rem] md:text-[1.3rem]">
              {{ sealMonogram }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== VENUE + COUNTDOWN SECTION ==================== -->
    <section class="relative z-10 w-full overflow-hidden border-t border-[#D4AF37]/20 bg-[radial-gradient(circle_at_80%_20%,_#0B2420_0%,_#061412_65%,_#040D0B_100%)] px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-28 lg:px-[6%] lg:py-32">
      <div class="mx-auto grid w-full max-w-5xl min-w-0 grid-cols-1 gap-5 rounded-[22px] border border-[#D4AF37]/30 bg-[#12332E]/45 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:gap-6 sm:rounded-[26px] sm:p-6 md:p-8 lg:grid-cols-2 lg:gap-8 lg:p-10">
        <!-- Venue -->
        <div class="flex min-w-0 flex-col rounded-[16px] border border-[#D4AF37]/10 bg-black/10 p-5 text-center sm:p-7 md:p-8 lg:text-left">
          <span class="mb-3 block font-[Plus_Jakarta_Sans] text-[0.62rem] font-semibold uppercase tracking-[2.5px] text-[#D4AF37] sm:text-[0.7rem] sm:tracking-[3px] md:text-[0.75rem] md:tracking-[4px]">
            <TemplateEditable field="venueTag" :value="venueTag" as="span" placeholder="Royal Venue" />
          </span>

          <h3 class="mb-3 min-w-0 break-words font-semibold leading-snug text-[#F7F5F0] text-[1.55rem] sm:text-[1.8rem] md:text-2xl lg:text-[2.2rem]">
            <TemplateEditable field="venueName" :value="venueName" as="span" placeholder="The Raviz Kadavu" />
          </h3>

          <p class="mb-2 break-words font-[Plus_Jakarta_Sans] font-medium text-[0.95rem] text-[#F4E096] sm:text-[1rem] md:text-[1.1rem]">
            <TemplateEditable field="venueCity" :value="venueCity" as="span" placeholder="Kozhikode (Calicut), Kerala" />
          </p>

          <p class="break-words whitespace-pre-line font-[Plus_Jakarta_Sans] font-light leading-[1.65] text-[0.83rem] text-[#A3B8B5] sm:text-[0.9rem] md:text-[0.95rem]">
            <TemplateEditable field="venueAddress" :value="venueAddress" as="span" multiline placeholder="NH 66, Bypass Road, Azhinjilam, Kerala 673632." />
          </p>

          <a
            :href="googleMapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-3 font-[Plus_Jakarta_Sans] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#F4E096] transition-colors duration-300 hover:bg-[#D4AF37]/20 sm:text-[11px] sm:tracking-[0.15em] lg:w-fit lg:justify-start"
          >
            <MapPin :size="14" class="shrink-0" />
            <span>View on Google Maps</span>
          </a>
        </div>

        <!-- Countdown -->
        <div class="flex min-w-0 flex-col items-center justify-center rounded-[16px] border border-[#D4AF37]/15 bg-black/30 p-5 text-center shadow-inner sm:p-7 md:p-8">
          <span class="mb-5 max-w-full break-words font-[Plus_Jakarta_Sans] text-[0.62rem] font-medium uppercase tracking-[2px] text-[#A3B8B5] sm:text-[0.7rem] sm:tracking-[2.5px] md:text-[0.75rem] md:tracking-[3px]">
            <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Counting Down To Forever" />
          </span>
          <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
        </div>
      </div>
    </section>

    <!-- ==================== SECTIONS ==================== -->
    <div class="w-full min-w-0 overflow-hidden">
      <TemplateCelebrations :show-events="showEvents" theme="dark-gold" />
      <TemplateCouplePhoto
        :photo-url="couplePhoto"
        :groom-name="groomName"
        :bride-name="brideName"
        :show-photo-section="showPhotoSection"
        theme="dark-gold"
      />
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="dark-gold"
      />
    </div>

    <!-- ==================== FOOTER ==================== -->
    <footer class="relative z-10 w-full overflow-hidden border-t border-[#D4AF37]/15 bg-[#030A09] px-4 py-10 text-center sm:px-6 sm:py-12 md:py-14">
      <div class="mb-3 break-words font-semibold tracking-[2px] text-[#D4AF37] text-xl sm:text-2xl sm:tracking-[3px] lg:text-3xl lg:tracking-[4px]">
        {{ monogram }}
      </div>
      <p class="mx-auto max-w-2xl break-words font-[Plus_Jakarta_Sans] text-[0.58rem] uppercase leading-relaxed tracking-[1.2px] text-[#A3B8B5] sm:text-[0.65rem] sm:tracking-[1.5px] md:text-[0.75rem] md:tracking-[2px]">
        <TemplateEditable field="footerBlessing" :value="footerBlessing" as="span" placeholder="With blessings from family & friends" />
      </p>
    </footer>
  </div>
</template>

<style scoped>
@keyframes sealRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
