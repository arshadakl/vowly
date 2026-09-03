<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl } from '@vowly/utils'
import { Calendar, Clock, MapPin, Sparkles, Heart, Users, ChevronDown, Navigation } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('kerala-kasavu')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Vijay')
const brideName = computed(() => inv.value.brideName || 'Sreelakshmi')
const groomParents = computed(() => inv.value.groomParents || 'Son of Smt. Lakshmi & Sri. R. Menon')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Smt. Radhika & Sri. K. Narayanan')
const weddingDate = computed(() => inv.value.weddingDate || '2026-09-12')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'The Leela Raviz Kovalam')
const venueAddress = computed(() => inv.value.events?.[0]?.address || 'Beach Road, Kovalam, Thiruvananthapuram, Kerala 695527')
const googleMapUrl = computed(() => inv.value.events?.[0]?.googleMapUrl || googleMapsOpenUrl(`${venueName.value} ${venueAddress.value}`))
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')

const heroTagline = computed(() => inv.value.customization.text.heroTagline || 'Together with their families, request the honour of your presence as they begin their beautiful journey as one.')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting down to our forever')
const eyebrowMal = computed(() => inv.value.customization.text.eyebrowMal || 'വിവാഹ ക്ഷണം')
const eyebrowEn = computed(() => inv.value.customization.text.eyebrowEn || 'A CELEBRATION OF LOVE')
const taglineMal = computed(() => inv.value.customization.text.taglineMal || 'സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു')
const ceremonySubtitle = computed(() => inv.value.customization.text.ceremonySubtitle || 'SAVE THE DATE')
const ceremonyTitle = computed(() => inv.value.customization.text.ceremonyTitle || 'The Celebration')
const saveTheDateText = computed(() => inv.value.customization.text.saveTheDateText || 'Save The Date')
const saveTheDateNote = computed(() => inv.value.customization.text.saveTheDateNote || 'Add our special day directly to your calendar and celebrate with us.')
const footerSub = computed(() => inv.value.customization.text.footerSub || 'WE LOOK FORWARD TO CELEBRATING THIS BEAUTIFUL DAY WITH YOU')
const footerMark = computed(() => inv.value.customization.text.footerMark || 'സ്നേഹപൂർവ്വം')
const dressCode = computed(() => inv.value.customization.text.dressCode || 'Traditional Kerala Kasavu or Formal Ethnic')
const muhurthamTime = computed(() => inv.value.events?.[0]?.startTime || '8:00 AM')
const muhurthamNote = computed(() => inv.value.customization.text.muhurthamNote || 'The sacred ceremony begins at the auspicious hour')
const receptionTime = computed(() => inv.value.customization.text.receptionTime || '7:00 PM onwards')
const receptionNote = computed(() => inv.value.customization.text.receptionNote || 'An evening of celebration, dinner & togetherness')

const monogram = computed(() => {
  const g = groomName.value?.trim()?.charAt(0)?.toUpperCase() || 'V'
  const b = brideName.value?.trim()?.charAt(0)?.toUpperCase() || 'S'
  return `${b} & ${g}`
})

const formatDate = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(year ?? 2000, (month ?? 1) - 1, day ?? 1)))
  } catch {
    return dateStr
  }
}

const details = computed(() => [
  { icon: Calendar, label: 'The Date', value: formatDate(weddingDate.value) },
  { icon: Clock, label: 'Muhurtham', value: muhurthamTime.value, note: muhurthamNote.value },
  { icon: Heart, label: 'Reception', value: receptionTime.value, note: receptionNote.value },
])

provide('invitation', inv)
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-x-hidden text-[#2C2423] text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      backgroundColor: '#F8F4EE',
      fontFamily: `'Cormorant Garamond', Georgia, serif`,
    }"
  >
    <!-- ==================== BACKGROUND ==================== -->
    <div
      class="pointer-events-none fixed inset-0 z-0 opacity-[0.055]"
      :style="{
        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(184,151,88,.4) 0.7px, transparent 0.8px), radial-gradient(circle at 80% 60%, rgba(94,33,41,.25) 0.6px, transparent 0.8px)`,
        backgroundSize: '28px 28px, 42px 42px',
      }"
    />
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#E8D7BD]/30 blur-[140px]" />
      <div class="absolute top-[45%] -left-40 h-[450px] w-[450px] rounded-full bg-[#EAD5D7]/25 blur-[130px]" />
      <div class="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-[#DFD3BA]/25 blur-[150px]" />
    </div>

    <!-- ==================== FLOATING PETALS ==================== -->
    <div class="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      <div
        v-for="(petal, index) in [
          { left: '7%', delay: 0, duration: 18 },
          { left: '20%', delay: 4, duration: 23 },
          { left: '38%', delay: 2, duration: 20 },
          { left: '62%', delay: 5, duration: 25 },
          { left: '78%', delay: 1, duration: 19 },
          { left: '93%', delay: 6, duration: 22 },
        ]"
        :key="index"
        class="petal absolute -top-10 h-4 w-2.5 rounded-[20%_80%_20%_80%]"
        :style="{
          left: petal.left,
          background: 'linear-gradient(135deg, #E8CED0, #E6D7BE)',
          animationDuration: `${petal.duration}s`,
          animationDelay: `${petal.delay}s`,
        }"
      />
    </div>

    <!-- ==================== HERO SECTION ==================== -->
    <section id="hero-section" class="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-28 text-center sm:py-32">
      <!-- Decorative Frame -->
      <div class="pointer-events-none absolute inset-3 sm:inset-6">
        <div class="absolute inset-0 rounded-t-[180px] border border-[#C6A66A]/50 sm:rounded-t-[260px]" />
        <div class="absolute inset-3 rounded-t-[170px] border border-[#C6A66A]/20 sm:rounded-t-[250px]" />
        <div class="absolute left-8 top-8 h-12 w-12 border-l border-t border-[#C6A66A]/60" />
        <div class="absolute right-8 top-8 h-12 w-12 border-r border-t border-[#C6A66A]/60" />
        <div class="absolute bottom-8 left-8 h-12 w-12 border-b border-l border-[#C6A66A]/60" />
        <div class="absolute bottom-8 right-8 h-12 w-12 border-b border-r border-[#C6A66A]/60" />
      </div>

      <!-- Hanging Bells -->
      <div class="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center gap-14 px-6 sm:gap-28">
        <div
          v-for="(delay, index) in [0, 0.5, 1]"
          :key="index"
          class="bell origin-top"
          :style="{ animationDelay: `${delay}s` }"
        >
          <svg viewBox="0 0 24 45" class="w-5 opacity-70">
            <path d="M12 0V8" stroke="#C6A66A" stroke-width="1.2" />
            <path d="M6 11C6 6 8.5 4 12 4s6 2 6 7l2 11H4z" fill="#E5D3AF" />
            <circle cx="12" cy="25" r="2.3" fill="#6B2631" />
          </svg>
        </div>
      </div>

      <!-- Monogram -->
      <div class="relative z-10 mb-9">
        <div class="absolute inset-[-9px] rounded-full border border-[#C6A66A]/25" />
        <div class="absolute inset-[-4px] rounded-full border border-[#C6A66A]/50" />
        <div
          class="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#C6A66A] bg-[#FFFDF9]/80 text-2xl text-[#7A2634] shadow-[0_15px_45px_rgba(94,33,41,0.12)] backdrop-blur-xl"
        >
          <TemplateEditable field="monogram" :value="monogram" as="span" placeholder="S & V" />
        </div>
      </div>

      <!-- Eyebrow -->
      <div class="relative z-10">
        <p class="text-xl font-medium text-[#7A2634]">
          <TemplateEditable field="eyebrowMal" :value="eyebrowMal" as="span" placeholder="വിവാഹ ക്ഷണം" />
        </p>
        <div class="mt-3 flex items-center justify-center gap-3">
          <span class="h-px w-8 bg-[#C6A66A]/50" />
          <p class="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8E7B61]">
            <TemplateEditable field="eyebrowEn" :value="eyebrowEn" as="span" placeholder="A CELEBRATION OF LOVE" />
          </p>
          <span class="h-px w-8 bg-[#C6A66A]/50" />
        </div>
      </div>

      <!-- Couple -->
      <div class="relative z-10 my-8 flex flex-col items-center">
        <!-- Bride -->
        <div>
          <h1 class="text-[3.7rem] font-light leading-[0.85] tracking-[-0.04em] text-[#4A171F] sm:text-7xl md:text-8xl lg:text-9xl">
            <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride" />
          </h1>
          <p class="mx-auto mt-4 max-w-sm text-[9px] font-medium uppercase tracking-[0.16em] text-[#80756E] sm:text-[10px]">
            <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Smt. Radhika & Sri. K. Narayanan" />
          </p>
        </div>

        <!-- Decorative Center with Peacocks & Nilavilakku -->
        <div class="relative my-8 flex items-center justify-center">
          <div class="absolute h-px w-32 -translate-x-24 bg-gradient-to-r from-transparent to-[#C6A66A]/70" />
          <div class="absolute h-px w-32 translate-x-24 bg-gradient-to-l from-transparent to-[#C6A66A]/70" />
          <div class="relative z-10 flex items-center gap-5 rounded-full bg-[#F8F4EE] px-6 py-2">
            <!-- Left Peacock -->
            <svg class="w-9 opacity-85" viewBox="0 0 60 60" fill="none">
              <path d="M30 40c-4-10-2-20 4-26" stroke="#4D6A58" stroke-width="2.3" stroke-linecap="round" />
              <circle cx="35" cy="12" r="4" fill="#4D6A58" />
              <circle cx="35" cy="12" r="1.4" fill="#C6A66A" />
              <path d="M30 40c6-8 14-10 22-6M30 40c6-4 15-3 20 2" stroke="#C6A66A" stroke-width="1.5" stroke-linecap="round" />
            </svg>

            <!-- Nilavilakku (Lamp) -->
            <svg class="w-9" viewBox="0 0 60 90" fill="none">
              <ellipse cx="30" cy="74" rx="16" ry="4" fill="#E6D6B7" />
              <rect x="28" y="48" width="4" height="24" fill="#C6A66A" />
              <path d="M16 40h28l-3 8H19z" fill="#E6D6B7" />
              <ellipse cx="30" cy="34" rx="8" ry="4" fill="#C6A66A" />
              <path class="lamp-flame" d="M30 8c5 7 6 12 2 17-2-2-4-2-6 0-3-5-2-11 4-17z" fill="#D4AF37" />
            </svg>

            <!-- Right Peacock (mirrored) -->
            <svg class="w-9 scale-x-[-1] opacity-85" viewBox="0 0 60 60" fill="none">
              <path d="M30 40c-4-10-2-20 4-26" stroke="#4D6A58" stroke-width="2.3" stroke-linecap="round" />
              <circle cx="35" cy="12" r="4" fill="#4D6A58" />
              <circle cx="35" cy="12" r="1.4" fill="#C6A66A" />
              <path d="M30 40c6-8 14-10 22-6M30 40c6-4 15-3 20 2" stroke="#C6A66A" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <!-- Groom -->
        <div>
          <h1 class="text-[3.7rem] font-light leading-[0.85] tracking-[-0.04em] text-[#4A171F] sm:text-7xl md:text-8xl lg:text-9xl">
            <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom" />
          </h1>
          <p class="mx-auto mt-4 max-w-sm text-[9px] font-medium uppercase tracking-[0.16em] text-[#80756E] sm:text-[10px]">
            <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Smt. Lakshmi & Sri. R. Menon" />
          </p>
        </div>
      </div>

      <!-- Tagline -->
      <div class="relative z-10 max-w-2xl px-4">
        <Sparkles class="mx-auto mb-5 text-[#C6A66A]" :size="18" :stroke-width="1.3" />
        <p class="text-xl font-light italic leading-relaxed text-[#4B3B39] sm:text-2xl">
          <TemplateEditable field="heroTagline" :value="heroTagline" as="span" placeholder="Together with their families..." multiline />
        </p>
        <p class="mt-5 text-lg tracking-wide text-[#7A2634]">
          <TemplateEditable field="taglineMal" :value="taglineMal" as="span" placeholder="സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു" />
        </p>
      </div>

      <!-- Scroll Hint -->
      <a href="#details" class="relative z-10 mt-12 flex flex-col items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#8B7A67]">
        <span>Discover Our Celebration</span>
        <ChevronDown :size="17" class="text-[#C6A66A] scroll-bounce" />
      </a>
    </section>

    <!-- ==================== MARQUEE BAND ==================== -->
    <div class="relative z-20 overflow-hidden border-y border-[#C6A66A]/50 bg-[#40151B] py-4 text-[#EADBBF]">
      <div class="marquee-track flex whitespace-nowrap text-xs uppercase tracking-[0.22em] sm:text-sm">
        <div
          v-for="n in 5"
          :key="n"
          class="flex items-center gap-8 pr-8"
        >
          <span>{{ brideName }} & {{ groomName }}</span>
          <span class="text-[#C6A66A]">&#10022;</span>
          <span>{{ formatDate(weddingDate) }}</span>
          <span class="text-[#C6A66A]">&#10022;</span>
          <span>{{ venueName }}</span>
          <span class="text-[#C6A66A]">&#10022;</span>
        </div>
      </div>
    </div>

    <!-- ==================== DETAILS SECTION ==================== -->
    <section id="celebrations-section" class="relative z-10 flex flex-col items-center px-6 py-24 text-center sm:py-32">
      <!-- Heading -->
      <div class="mb-14">
        <div class="mb-5 flex items-center justify-center gap-4 text-[#C6A66A]">
          <span class="h-px w-12 bg-[#C6A66A]/50" />
          <Sparkles :size="16" :stroke-width="1.3" />
          <span class="h-px w-12 bg-[#C6A66A]/50" />
        </div>
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9A8155]">
          <TemplateEditable field="ceremonySubtitle" :value="ceremonySubtitle" as="span" placeholder="SAVE THE DATE" />
        </p>
        <h2 class="text-5xl font-light tracking-tight text-[#4A171F] sm:text-6xl">
          <TemplateEditable field="ceremonyTitle" :value="ceremonyTitle" as="span" placeholder="The Celebration" />
        </h2>
      </div>

      <!-- Details Card -->
      <div class="relative mb-20 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#C6A66A]/30 bg-[#FFFDF9]/75 px-7 pb-10 pt-16 shadow-[0_30px_80px_rgba(63,38,30,0.08)] backdrop-blur-xl sm:px-14 sm:pb-14">
        <div class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#C6A66A] to-transparent" />
        <div class="absolute left-1/2 top-5 -translate-x-1/2 text-xs tracking-[0.5em] text-[#C6A66A]">
          &#10022; &#10022; &#10022;
        </div>

        <div
          v-for="(item, index) in details"
          :key="item.label"
          class="relative flex flex-col items-center border-b border-[#C6A66A]/15 py-8 last:border-none"
        >
          <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#C6A66A]/25 bg-[#F8F1E7] text-[#9B7845]">
            <component :is="item.icon" :size="18" :stroke-width="1.4" />
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9B8256]">{{ item.label }}</span>
          <span class="mt-3 text-3xl font-light text-[#3D2A2A]">{{ item.value }}</span>
          <p v-if="item.note" class="mt-2 max-w-md text-xs leading-relaxed text-[#82756E]">{{ item.note }}</p>
        </div>

        <!-- Venue -->
        <div class="flex flex-col items-center border-b border-[#C6A66A]/15 py-8">
          <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#C6A66A]/25 bg-[#F8F1E7] text-[#9B7845]">
            <MapPin :size="18" :stroke-width="1.4" />
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9B8256]">The Venue</span>
          <span class="mt-3 text-3xl font-light text-[#3D2A2A]">
            <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
          </span>
          <p class="mt-3 max-w-md text-xs leading-relaxed text-[#82756E]">
            <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" multiline />
          </p>
          <a
            :href="googleMapUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-6 inline-flex items-center gap-2 rounded-full border border-[#C6A66A]/50 bg-[#5E2129] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFF9EF] shadow-[0_10px_25px_rgba(94,33,41,0.18)] transition-all hover:-translate-y-0.5 hover:scale-[1.02]"
          >
            <MapPin :size="14" :stroke-width="1.5" />
            Get Directions
          </a>
        </div>

        <!-- Dress Code -->
        <div class="flex flex-col items-center pt-8">
          <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#C6A66A]/25 bg-[#F8F1E7] text-[#9B7845]">
            <Users :size="18" :stroke-width="1.4" />
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9B8256]">Dress Code</span>
          <p class="mt-3 text-xl font-light text-[#3D2A2A]">
            <TemplateEditable field="dressCode" :value="dressCode" as="span" placeholder="Traditional Kerala Kasavu or Formal Ethnic" />
          </p>
        </div>
      </div>

      <!-- Countdown -->
      <div class="flex w-full max-w-4xl flex-col items-center">
        <div class="mb-7 flex items-center gap-4">
          <span class="h-px w-10 bg-[#C6A66A]/40" />
          <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8B7A67]">
            <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Counting down to our forever" />
          </p>
          <span class="h-px w-10 bg-[#C6A66A]/40" />
        </div>

        <div class="mb-12 w-full max-w-4xl">
          <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
        </div>

        <!-- Save Date Button -->
        <div class="text-center">
          <p class="mt-5 max-w-sm text-xs leading-relaxed text-[#82756E]">
            <TemplateEditable field="saveTheDateNote" :value="saveTheDateNote" as="span" placeholder="Add our special day directly to your calendar" multiline />
          </p>
        </div>
      </div>
    </section>

    <!-- ==================== CELEBRATIONS ==================== -->
    <TemplateCelebrations :show-events="showEvents" theme="crimson" />

    <!-- ==================== COUPLE PHOTO ==================== -->
    <TemplateCouplePhoto
      :photo-url="couplePhoto"
      :groom-name="groomName"
      :bride-name="brideName"
      :show-photo-section="showPhotoSection"
      theme="crimson"
    />

    <!-- ==================== RSVP ==================== -->
    <TemplateRsvp v-if="inv.rsvp?.enabled"       :groom-name="groomName"
      :bride-name="brideName"
      :whatsapp-number="whatsappNumber"
      theme="crimson"
    />

    <!-- ==================== FOOTER ==================== -->
    <footer class="relative z-10 overflow-hidden bg-[#351116] px-6 py-20 text-center text-[#FAF7F2]">
      <div class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#C6A66A] to-transparent" />
      <div class="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-[#6B2631]/30 blur-[100px]" />
      <div class="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-[#C6A66A]/10 blur-[100px]" />

      <div class="relative mx-auto flex max-w-xl flex-col items-center">
        <div class="mb-8 flex items-center gap-4 text-[#C6A66A]">
          <span class="h-px w-16 bg-[#C6A66A]/50" />
          <Sparkles :size="16" :stroke-width="1.3" />
          <span class="h-px w-16 bg-[#C6A66A]/50" />
        </div>
        <div class="text-5xl font-light tracking-tight text-[#EADBBF] sm:text-6xl">
          <TemplateEditable field="footerLogo" :value="monogram" as="span" placeholder="S & V" />
        </div>
        <p class="mt-4 text-2xl text-[#D9C29A]">
          <TemplateEditable field="footerMark" :value="footerMark" as="span" placeholder="സ്നേഹപൂർവ്വം" />
        </p>
        <div class="my-8 h-px w-24 bg-[#C6A66A]/40" />
        <p class="max-w-sm text-[10px] font-medium uppercase leading-6 tracking-[0.28em] text-[#FAF7F2]/55">
          <TemplateEditable field="footerSub" :value="footerSub" as="span" placeholder="WE LOOK FORWARD TO CELEBRATING THIS BEAUTIFUL DAY WITH YOU" multiline />
        </p>
        <div class="mt-10 flex items-center gap-3 text-xs text-[#C6A66A]">
          <span>&#10022;</span>
          <span class="h-px w-10 bg-[#C6A66A]/40" />
          <span>&#10022;</span>
          <span class="h-px w-10 bg-[#C6A66A]/40" />
          <span>&#10022;</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes petalFloat {
  0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
  10% { opacity: 0.45; }
  90% { opacity: 0.45; }
  100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
}
.petal {
  animation: petalFloat linear infinite;
  will-change: transform, opacity;
}

@keyframes bellSwing {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
.bell {
  animation: bellSwing 4s ease-in-out infinite;
  transform-origin: top center;
}

@keyframes flameFlicker {
  0%, 100% { transform: scaleY(1) scaleX(1); }
  25% { transform: scaleY(1.15) scaleX(0.94); }
  50% { transform: scaleY(0.95) scaleX(1.05); }
  75% { transform: scaleY(1.1) scaleX(0.97); }
}
.lamp-flame {
  animation: flameFlicker 1.8s ease-in-out infinite;
  transform-origin: bottom center;
}

@keyframes marqueeScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  animation: marqueeScroll 30s linear infinite;
}

@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
.scroll-bounce {
  animation: scrollBounce 2s ease-in-out infinite;
}
</style>
