<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import { getTemplateDefinition } from '@vowly/types'
import { googleMapsOpenUrl, fontIdToCss } from '@vowly/utils'
import { CalendarDays, MapPin, ExternalLink, Sparkles, ArrowDown, Heart, Navigation, Clock3 } from 'lucide-vue-next'
import TemplateEditable from '~/components/templates/shared/TemplateEditable.vue'
import TemplateCountdown from '~/components/templates/shared/TemplateCountdown.vue'
import TemplateCelebrations from '~/components/templates/shared/TemplateCelebrations.vue'
import TemplateCouplePhoto from '~/components/templates/shared/TemplateCouplePhoto.vue'
import TemplateRsvp from '~/components/templates/shared/TemplateRsvp.vue'
import TemplateFooter from '~/components/templates/shared/TemplateFooter.vue'

const props = defineProps<{ invitation: PublicInvitation }>()

const def = getTemplateDefinition('ivory-arch')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Arjun')
const brideName = computed(() => inv.value.brideName || 'Meera')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-01')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'Manthan Beach Resort')
const venueAddress = computed(() => inv.value.events?.[0]?.address || 'Kapu, Udupi, Karnataka')
const googleMapUrl = computed(() => inv.value.events?.[0]?.googleMapUrl || googleMapsOpenUrl(`${venueName.value} ${venueAddress.value}`))
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')
const coverImage = computed(() => inv.value.coverImage || def.backgroundImage)

const heroPre = computed(() => inv.value.customization.text.heroPre || 'JOIN US TO CELEBRATE')
const heroTitle = computed(() => inv.value.customization.text.heroTitle || 'Our Reception')
const heroTagline = computed(() => inv.value.customization.text.heroTagline || 'A celebration of love by the ocean waves')
const heroLocation = computed(() => inv.value.customization.text.heroLocation || 'Kapu Beach, Udupi')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'Counting Down To The Big Day')
const countdownSubtitle = computed(() => inv.value.customization.text.countdownSubtitle || "We can't wait to share this magical moment with you!")
const detailsTitle = computed(() => inv.value.customization.text.detailsTitle || 'When & Where')
const dateTimeLabel = computed(() => inv.value.customization.text.dateTimeLabel || 'Date & Time')
const venueLabel = computed(() => inv.value.customization.text.venueLabel || 'Venue')
const mapButtonText = computed(() => inv.value.customization.text.mapButtonText || 'View on Google Maps')
const saveTheDateText = computed(() => inv.value.customization.text.saveTheDateText || 'Explore The Details')
const rsvpText = computed(() => inv.value.customization.text.rsvpText || 'RSVP')
const footerTitle = computed(() => inv.value.customization.text.footerTitle || 'We look forward to celebrating with you!')
const footerLocation = computed(() => inv.value.customization.text.footerLocation || 'Kapu Beach \u2022 Udupi \u2022 Karnataka')

const formatDate = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Intl.DateTimeFormat('en-IN', {
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

const weddingDateFull = computed(() => formatDate(weddingDate.value))

provide('invitation', inv)

const scrollToDetails = () => {
  document.getElementById('details')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const scrollToCountdown = () => {
  document.getElementById('countdown-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <main
    class="relative min-h-screen w-full overflow-x-hidden bg-[#f8f5ef] text-[#17243a] text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      fontFamily: fontIdToCss(inv.customization?.fontFamily),
    }"
  >
    <!-- Global Decoration -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div class="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#d8c5a0]/10 blur-3xl" />
      <div class="absolute -right-32 top-[45%] h-80 w-80 rounded-full bg-[#1c3557]/5 blur-3xl" />
    </div>

    <!-- ==================== HERO ==================== -->
    <header
      class="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#132640] px-4 py-8 text-white sm:px-6 lg:px-10"
      :style="{
        backgroundImage: `linear-gradient(180deg, rgba(12,28,48,0.34) 0%, rgba(12,28,48,0.48) 50%, rgba(12,28,48,0.82) 100%), url('${coverImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <!-- Dark overlay -->
      <div class="absolute inset-0 bg-[#07111f]/15" />

      <!-- Decorative glow circles -->
      <div class="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[600px] sm:w-[600px]" />
      <div class="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7bb7c]/20 sm:h-[440px] sm:w-[440px]" />

      <!-- Floating Gold Particles -->
      <div class="pointer-events-none absolute inset-0">
        <div
          v-for="index in 12"
          :key="index"
          class="particle absolute h-1 w-1 rounded-full bg-[#ead7ad]/70"
          :style="{
            left: `${((index - 1) * 29) % 100}%`,
            top: `${70 + (((index - 1) * 17) % 30)}%`,
            animationDuration: `${5 + ((index - 1) % 4)}s`,
            animationDelay: `${(index - 1) * 0.4}s`,
          }"
        />
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
        <!-- Top label -->
        <div class="mb-5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-[#e3cf9f] sm:text-xs sm:tracking-[0.42em]">
          <span class="h-px w-8 bg-[#c8a96b]/80 sm:w-12" />
          <TemplateEditable field="heroPre" :value="heroPre" as="span" placeholder="JOIN US TO CELEBRATE" />
          <span class="h-px w-8 bg-[#c8a96b]/80 sm:w-12" />
        </div>

        <!-- Couple names -->
        <div class="mb-5 flex max-w-full flex-col items-center justify-center leading-none">
          <div class="font-['Playfair_Display'] text-[clamp(2.4rem,12cqw,4.5rem)] break-words font-normal tracking-[-0.05em] text-white">
            <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Meera" />
          </div>
          <div class="-my-1 flex items-center gap-3 text-[#d8bd80] sm:-my-2 sm:gap-5">
            <span class="h-px w-8 bg-[#d8bd80]/60 sm:w-14" />
            <Heart :size="18" :stroke-width="1.2" class="fill-[#d8bd80]/20 text-[#d8bd80]" />
            <span class="h-px w-8 bg-[#d8bd80]/60 sm:w-14" />
          </div>
          <div class="font-['Playfair_Display'] text-[clamp(2.4rem,12cqw,4.5rem)] break-words font-normal tracking-[-0.05em] text-white">
            <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Arjun" />
          </div>
        </div>

        <!-- Reception title -->
        <div class="mb-4 font-['Great_Vibes'] text-[clamp(1.8rem,8cqw,3.5rem)] break-words leading-none text-[#d8bd80]">
          <TemplateEditable field="heroTitle" :value="heroTitle" as="span" placeholder="Our Reception" />
        </div>

        <!-- Tagline -->
        <div class="mb-7 max-w-[580px] px-3 font-['Playfair_Display'] text-sm italic leading-7 text-white/80 sm:text-lg sm:leading-8">
          <TemplateEditable field="heroTagline" :value="heroTagline" as="span" placeholder="A celebration of love by the ocean waves" multiline />
        </div>

        <!-- Date / Location Split Card -->
        <div class="mb-8 grid w-full max-w-[430px] grid-cols-1 overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md sm:grid-cols-2">
          <div class="flex min-h-[68px] items-center justify-center gap-3 border-b border-white/10 px-4 py-3 sm:border-b-0 sm:border-r">
            <CalendarDays :size="18" :stroke-width="1.5" class="shrink-0 text-[#d8bd80]" />
            <span class="text-xs font-medium sm:text-sm">
              <TemplateEditable field="weddingDate" :value="weddingDateFull" as="span" placeholder="Date" />
            </span>
          </div>
          <div class="flex min-h-[68px] items-center justify-center gap-3 px-4 py-3">
            <MapPin :size="18" :stroke-width="1.5" class="shrink-0 text-[#d8bd80]" />
            <span class="text-xs font-medium sm:text-sm">
              <TemplateEditable field="heroLocation" :value="heroLocation" as="span" placeholder="Location" />
            </span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex w-full max-w-[430px] flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <button
            type="button"
            class="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#d0b477] px-7 text-sm font-semibold text-[#14253d] shadow-[0_12px_35px_rgba(0,0,0,0.22)] transition hover:bg-[#e0c991] active:scale-[0.97]"
            @click="scrollToDetails"
          >
            <TemplateEditable field="saveTheDateText" :value="saveTheDateText" as="span" placeholder="Explore The Details" />
            <ArrowDown :size="16" />
          </button>
          <button
            type="button"
            class="flex min-h-12 items-center justify-center rounded-full border border-white/40 bg-white/5 px-7 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-[#14253d] active:scale-[0.97]"
            @click="scrollToCountdown"
          >
            <TemplateEditable field="rsvpText" :value="rsvpText" as="span" placeholder="RSVP" />
          </button>
        </div>

        <!-- Scroll hint -->
        <div class="mt-10 hidden items-center gap-2 text-[9px] uppercase tracking-[0.35em] text-white/50 sm:flex">
          <span>Scroll to discover</span>
          <ArrowDown :size="12" />
        </div>
      </div>
    </header>

    <!-- ==================== COUNTDOWN ==================== -->
    <section id="countdown-section" class="relative overflow-hidden bg-[#f8f5ef] px-4 py-16 sm:px-6 sm:py-24">
      <div class="pointer-events-none absolute left-1/2 top-0 h-40 w-[80%] -translate-x-1/2 rounded-full bg-[#d4bd8c]/10 blur-3xl" />
      <div class="relative z-10 mx-auto max-w-5xl text-center">
        <div class="mb-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#a38343] sm:text-xs">
          THE COUNTDOWN
        </div>
        <h2 class="mx-auto max-w-2xl font-['Playfair_Display'] text-3xl font-normal leading-tight text-[#172b45] sm:text-5xl">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="Counting Down To The Big Day" multiline />
        </h2>
        <div class="mx-auto my-6 flex items-center justify-center gap-3">
          <span class="h-px w-10 bg-[#c8a96b]" />
          <Sparkles :size="15" :stroke-width="1.2" class="text-[#b39150]" />
          <span class="h-px w-10 bg-[#c8a96b]" />
        </div>
        <p class="mx-auto mb-10 max-w-xl font-['Playfair_Display'] text-sm italic leading-7 text-[#697386] sm:text-base">
          <TemplateEditable field="countdownSubtitle" :value="countdownSubtitle" as="span" placeholder="We can't wait to share this magical moment with you!" multiline />
        </p>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </div>
    </section>

    <!-- ==================== EVENT DETAILS ==================== -->
    <section id="details" class="relative overflow-hidden bg-white px-4 py-16 sm:px-6 sm:py-24">
      <div class="mx-auto max-w-6xl">
        <!-- Section heading -->
        <div class="mb-10 text-center sm:mb-14">
          <div class="mb-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#a38343]">THE CELEBRATION</div>
          <h2 class="font-['Playfair_Display'] text-4xl font-normal text-[#172f4e] sm:text-5xl">
            <TemplateEditable field="detailsTitle" :value="detailsTitle" as="span" placeholder="When & Where" />
          </h2>
          <div class="mx-auto mt-5 flex items-center justify-center gap-3">
            <span class="h-px w-10 bg-[#c8a96b]" />
            <Heart :size="14" class="text-[#b39150]" :stroke-width="1.2" />
            <span class="h-px w-10 bg-[#c8a96b]" />
          </div>
        </div>

        <!-- Desktop editorial card (2-column split) -->
        <div class="grid overflow-hidden rounded-[28px] border border-[#e7dfcf] bg-[#f8f5ef] shadow-[0_25px_70px_rgba(23,43,69,0.08)] md:grid-cols-2">
          <!-- Date -->
          <div class="relative flex min-h-[300px] flex-col justify-center px-6 py-10 text-center md:px-12 lg:px-16">
            <div class="pointer-events-none absolute right-0 top-1/2 hidden h-32 w-px -translate-y-1/2 bg-[#d9c8a5] md:block" />
            <div class="mb-5 flex justify-center">
              <div class="flex h-14 w-14 items-center justify-center rounded-full border border-[#c8a96b]/40 bg-white text-[#a38343]">
                <CalendarDays :size="22" :stroke-width="1.3" />
              </div>
            </div>
            <div class="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#a38343]">
              <TemplateEditable field="dateTimeLabel" :value="dateTimeLabel" as="span" placeholder="Date & Time" />
            </div>
            <div class="font-['Playfair_Display'] text-2xl leading-snug text-[#172f4e] sm:text-3xl">
              <TemplateEditable field="weddingDateFull" :value="weddingDateFull" as="span" placeholder="Thursday, 1st December 2026" />
            </div>
            <div class="mt-3 flex items-center justify-center gap-2 text-sm text-[#697386]">
              <Clock3 :size="15" :stroke-width="1.4" />
              <span>
                <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '6:00 PM Onwards'" as="span" placeholder="Time" />
              </span>
            </div>
          </div>

          <!-- Venue (dark navy) -->
          <div class="relative flex min-h-[300px] flex-col justify-center bg-[#172f4e] px-6 py-10 text-center text-white md:px-12 lg:px-16">
            <div class="mb-5 flex justify-center">
              <div class="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8bd80]/40 bg-white/5 text-[#d8bd80]">
                <MapPin :size="22" :stroke-width="1.3" />
              </div>
            </div>
            <div class="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8bd80]">
              <TemplateEditable field="venueLabel" :value="venueLabel" as="span" placeholder="Venue" />
            </div>
            <div class="font-['Playfair_Display'] text-2xl leading-snug text-white sm:text-3xl">
              <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
            </div>
            <div class="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/65">
              <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" multiline />
            </div>
            <a
              :href="googleMapUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="mx-auto mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#d8bd80]/60 bg-[#d8bd80] px-6 text-sm font-semibold text-[#172f4e] transition hover:bg-[#ead6a5] active:scale-[0.97]"
            >
              <Navigation :size="16" :stroke-width="1.8" />
              <TemplateEditable field="mapButtonText" :value="mapButtonText" as="span" placeholder="View on Google Maps" />
              <ExternalLink :size="14" :stroke-width="1.8" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== CELEBRATIONS ==================== -->
    <section class="relative bg-[#f8f5ef]">
      <TemplateCelebrations :show-events="showEvents" theme="light" />
    </section>

    <!-- ==================== COUPLE PHOTO ==================== -->
    <section class="relative bg-white">
      <TemplateCouplePhoto
        :photo-url="couplePhoto"
        :groom-name="groomName"
        :bride-name="brideName"
        :show-photo-section="showPhotoSection"
        theme="light"
      />
    </section>

    <!-- ==================== RSVP ==================== -->
    <section id="rsvp" class="relative overflow-hidden bg-[#172f4e]">
      <div class="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d8bd80]/10 blur-3xl" />
      <div class="relative z-10">
        <TemplateRsvp v-if="inv.rsvp?.enabled"           :groom-name="groomName"
          :bride-name="brideName"
          :whatsapp-number="whatsappNumber"
          theme="light"
        />
      </div>
    </section>

    <!-- ==================== FOOTER ==================== -->
    <footer class="relative overflow-hidden bg-[#0d1d31] px-5 py-14 text-center text-white sm:py-20">
      <div class="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-[#d8bd80]" />
      <div class="mx-auto max-w-2xl">
        <div class="mb-5 flex items-center justify-center gap-3">
          <span class="h-px w-10 bg-[#d8bd80]/40" />
          <Heart :size="16" class="text-[#d8bd80]" :stroke-width="1.2" />
          <span class="h-px w-10 bg-[#d8bd80]/40" />
        </div>
        <h2 class="font-['Playfair_Display'] text-2xl font-normal leading-relaxed text-white sm:text-3xl">
          <TemplateEditable field="footerTitle" :value="footerTitle" as="span" placeholder="We look forward to celebrating with you!" multiline />
        </h2>
        <p class="mt-4 text-[10px] uppercase tracking-[0.28em] text-white/45 sm:text-xs">
          <TemplateEditable field="footerLocation" :value="footerLocation" as="span" placeholder="Kapu Beach \u2022 Udupi \u2022 Karnataka" />
        </p>
        <div class="mt-8 text-[9px] uppercase tracking-[0.3em] text-white/25">
          With love &bull; Always
        </div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
@keyframes particleFloat {
  0% { transform: translateY(-10px); opacity: 0; }
  15% { opacity: 0.7; }
  85% { opacity: 0.7; }
  100% { transform: translateY(-120px); opacity: 0; }
}
.particle {
  animation: particleFloat ease-out infinite;
  will-change: transform, opacity;
}
</style>
