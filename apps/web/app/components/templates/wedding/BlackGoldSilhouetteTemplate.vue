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

const def = getTemplateDefinition('black-gold-silhouette')
const inv = computed(() => props.invitation)

const groomName = computed(() => inv.value.groomName || 'Rizwan')
const brideName = computed(() => inv.value.brideName || 'Ayesha')
const weddingDate = computed(() => inv.value.weddingDate || '2026-12-25')
const weddingTz = computed(() => inv.value.weddingTz || 'Asia/Kolkata')
const venueName = computed(() => inv.value.events?.[0]?.venue || 'Grand Palace Hall')
const venueAddress = computed(() => inv.value.events?.[0]?.address || 'Calicut, Kerala')
const googleMapUrl = computed(() => inv.value.events?.[0]?.googleMapUrl || googleMapsOpenUrl(`${venueName.value} ${venueAddress.value}`))
const whatsappNumber = computed(() => inv.value.customization.text.whatsappNumber || '')
const groomParents = computed(() => inv.value.groomParents || 'Son of Mr. & Mrs. Rahman')
const brideParents = computed(() => inv.value.brideParents || 'Daughter of Mr. & Mrs. Ibrahim')
const showEvents = computed(() => inv.value.customization.showEvents !== false)
const showPhotoSection = computed(() => inv.value.showImages !== false)
const couplePhoto = computed(() => inv.value.coupleImageUrl || inv.value.brideImage || '')

const heroEventText = computed(() => inv.value.customization.text.heroEventText || 'request the honour of your presence')
const countdownTitle = computed(() => inv.value.customization.text.countdownTitle || 'The Countdown Begins')
const footerMessage = computed(() => inv.value.customization.text.footerMessage || 'We look forward to sharing this beautiful moment with you.')
const coverImage = computed(() => inv.value.coverImage || def.backgroundImage)

const monogram = computed(() => {
  const g = groomName.value?.trim()?.charAt(0)?.toUpperCase() || 'R'
  const b = brideName.value?.trim()?.charAt(0)?.toUpperCase() || 'A'
  return `${g}  &  ${b}`
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
    class="relative min-h-screen w-full overflow-x-hidden bg-black text-amber-50 text-[#2C2220] selection:bg-[#781B28] selection:text-[#FDFBF7]"
    :style="{
      containerType: 'inline-size',
      fontSize: `${inv.customization?.fontSize || 14}px`,
      '--surface': def.ogTheme.background,
      '--ink': def.ogTheme.foreground,
      '--accent': def.ogTheme.accent,
      fontFamily: `'Cinzel', 'Playfair Display', 'Times New Roman', serif`,
    }"
  >
    <!-- ==================== HERO ==================== -->
    <section id="hero-section" class="relative w-full overflow-hidden">
      <div class="absolute inset-0 z-0">
        <img
          :src="coverImage"
          alt=""
          class="h-full w-full object-cover object-center"
          loading="eager"
        >
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
      </div>

      <div class="relative z-10 mx-auto flex min-h-[92vh] max-w-lg flex-col items-center justify-center px-5 pb-28 pt-16 text-center">
        <!-- Top ornament -->
        <div class="mb-8 flex items-center gap-3">
          <div class="h-px w-10 bg-gradient-to-r from-transparent to-amber-500/70" />
          <Sparkles :size="14" class="text-amber-400" />
          <div class="h-px w-10 bg-gradient-to-l from-transparent to-amber-500/70" />
        </div>

        <!-- Names (groom-first) -->
        <div class="mb-2">
          <h1 class="text-3xl font-normal tracking-[0.15em] text-amber-100 sm:text-4xl">
            <TemplateEditable field="groomName" :value="groomName" as="span" placeholder="Groom Name" />
          </h1>
        </div>
        <div class="my-1 text-lg tracking-[0.3em] text-amber-500/90">&amp;</div>
        <div>
          <h1 class="text-3xl font-normal tracking-[0.15em] text-amber-100 sm:text-4xl">
            <TemplateEditable field="brideName" :value="brideName" as="span" placeholder="Bride Name" />
          </h1>
        </div>

        <!-- Event text -->
        <div class="mt-6">
          <p class="max-w-[280px] text-[13px] font-light tracking-wide text-amber-200/80">
            <TemplateEditable field="heroEventText" :value="heroEventText" as="span" placeholder="request the honour of your presence" />
          </p>
        </div>

        <!-- Date & Time badges -->
        <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
          <div class="flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/50 px-4 py-1.5 backdrop-blur-sm">
            <Calendar :size="13" class="text-amber-400" />
            <span class="text-[12px] tracking-wide text-amber-100">
              <TemplateEditable field="weddingDate" :value="formatDate(weddingDate)" as="span" placeholder="Wedding Date" />
            </span>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/50 px-4 py-1.5 backdrop-blur-sm">
            <Clock :size="13" class="text-amber-400" />
            <span class="text-[12px] tracking-wide text-amber-100">
              <TemplateEditable field="weddingTime" :value="inv.events?.[0]?.startTime || '10:00 AM'" as="span" placeholder="Time" />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== CONTENT ==================== -->
    <div class="relative z-10 mx-auto max-w-lg px-5 pb-24">
      <!-- Parents -->
      <section class="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-zinc-900/80 to-black p-6">
        <div class="mb-6 flex items-center justify-center gap-3">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent to-amber-600/40" />
          <span class="text-[10px] uppercase tracking-[0.35em] text-amber-500/80">With Blessings</span>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent to-amber-600/40" />
        </div>
        <div class="space-y-5 text-center">
          <p class="text-[14px] font-light leading-relaxed tracking-wide text-amber-100/90">
            <TemplateEditable field="groomParents" :value="groomParents" as="span" placeholder="Son of Mr. & Mrs. Rahman" multiline />
          </p>
          <div class="mx-auto h-px w-12 bg-amber-600/40" />
          <p class="text-[14px] font-light leading-relaxed tracking-wide text-amber-100/90">
            <TemplateEditable field="brideParents" :value="brideParents" as="span" placeholder="Daughter of Mr. & Mrs. Ibrahim" multiline />
          </p>
        </div>
      </section>

      <!-- Countdown -->
      <section class="mt-14 text-center">
        <h2 class="mb-8 text-[11px] font-medium uppercase tracking-[0.4em] text-amber-500/90">
          <TemplateEditable field="countdownTitle" :value="countdownTitle" as="span" placeholder="The Countdown Begins" />
        </h2>
        <TemplateCountdown :date="weddingDate" :time-zone="weddingTz" />
      </section>

      <!-- Venue -->
      <section class="mt-14 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-zinc-900/80 to-black p-6">
        <div class="mb-5 flex items-center justify-center gap-2">
          <MapPin :size="15" class="text-amber-400" />
          <span class="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-500/80">Venue</span>
        </div>
        <h3 class="text-center text-xl font-normal tracking-wide text-amber-50">
          <TemplateEditable field="venue" :value="venueName" as="span" placeholder="Venue Name" />
        </h3>
        <p class="mt-2 text-center text-[13px] font-light tracking-wide text-amber-200/70">
          <TemplateEditable field="venueAddress" :value="venueAddress" as="span" placeholder="Full Address" multiline />
        </p>
        <a
          :href="googleMapUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/10 py-2.5 text-[13px] font-medium tracking-wider text-amber-200 transition hover:bg-amber-500/20 active:scale-[0.98]"
        >
          <ExternalLink :size="14" />
          Get Directions
        </a>
      </section>

      <!-- Celebrations -->
      <TemplateCelebrations :show-events="showEvents" theme="dark-gold" />

      <!-- Couple Photo -->
      <TemplateCouplePhoto
        :photo-url="couplePhoto"
        :groom-name="groomName"
        :bride-name="brideName"
        :show-photo-section="showPhotoSection"
        theme="dark-gold"
      />

      <!-- RSVP -->
      <TemplateRsvp v-if="inv.rsvp?.enabled"         :groom-name="groomName"
        :bride-name="brideName"
        :whatsapp-number="whatsappNumber"
        theme="dark-gold"
      />

      <!-- Footer -->
      <footer class="mt-16 flex flex-col items-center text-center">
        <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/40 bg-zinc-900 text-sm tracking-[0.2em] text-amber-200">
          {{ monogram }}
        </div>
        <p class="max-w-[240px] text-[12px] font-light leading-relaxed tracking-wide text-amber-200/60">
          <TemplateEditable field="footerMessage" :value="footerMessage" as="span" placeholder="We look forward to sharing this beautiful moment with you." multiline />
        </p>
        <div class="mt-6 flex items-center gap-3 text-amber-600/50">
          <div class="h-px w-8 bg-amber-600/40" />
          <Heart :size="12" class="fill-current" />
          <div class="h-px w-8 bg-amber-600/40" />
        </div>
      </footer>
    </div>
  </div>
</template>
