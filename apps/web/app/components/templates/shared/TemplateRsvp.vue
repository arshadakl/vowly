<script setup lang="ts">
import { MessageCircle, CheckCircle2, XCircle, User, Send, Sparkles } from 'lucide-vue-next'

export type RsvpTheme =
  | 'gold'
  | 'dark-gold'
  | 'crimson'
  | 'emerald'
  | 'rose'
  | 'navy'
  | 'dark'
  | 'light'

const props = withDefaults(
  defineProps<{
    theme?: RsvpTheme
    groomName?: string
    brideName?: string
    whatsappNumber?: string
  }>(),
  { theme: 'light', groomName: 'Groom', brideName: 'Bride', whatsappNumber: '' },
)

const guestName = ref('')
const attending = ref<'yes' | 'no'>('yes')
const guestCount = ref('1')
const message = ref('')
const submitted = ref(false)
const error = ref('')

const cleanPhone = computed(() => (props.whatsappNumber || '').replace(/[^\d]/g, ''))

const guestCountOptions = ['1', '2', '3', '4', '5+']

function handleSendRsvp() {
  if (!guestName.value.trim()) {
    error.value = 'Please enter your name'
    return
  }
  error.value = ''

  const headerTitle = `*RSVP for ${props.groomName} & ${props.brideName}'s Celebration* ✨`
  const statusText = attending.value === 'yes' ? '✅ Joyfully Accepts' : '❌ Regretfully Declines'
  const guestsText = attending.value === 'yes' ? `👥 Guests: ${guestCount.value}` : ''
  const wishText = message.value.trim() ? `\n💬 *Wish*: "${message.value.trim()}"` : ''

  const textMsg =
    `${headerTitle}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Name*: ${guestName.value.trim()}\n` +
    `✨ *Status*: ${statusText}\n` +
    (guestsText ? `${guestsText}\n` : '') +
    wishText + '\n\n' +
    `Sent via Vowly`

  const targetPhone = cleanPhone.value || '919876543210'
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(textMsg)}`

  submitted.value = true
  setTimeout(() => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }, 300)
}

const themeClasses = computed(() => {
  const t = props.theme
  const themes: Record<RsvpTheme, Record<string, string>> = {
    gold: {
      container: 'bg-[#18130B]/90 border-[#D4AF37]/35 text-[#F5EBE0] shadow-[0_16px_40px_rgba(0,0,0,0.35)]',
      divider: 'bg-[#D4AF37]/40',
      sparkle: 'text-[#D4AF37]',
      title: 'text-[#F4E096]',
      subtitle: 'text-[#D8C7A5]',
      highlight: 'text-[#FAF5E6]',
      label: 'text-[#D4AF37]',
      input: 'bg-[#231B10]/85 border-[#D4AF37]/25 text-[#FAF6ED] placeholder-[#9E8B6B] focus:border-[#D4AF37]',
      inputIcon: 'text-[#D4AF37]/70',
      pillAccept: 'bg-[#D4AF37] text-[#18130B] font-extrabold border-[#D4AF37] shadow-md shadow-[#D4AF37]/20',
      pillDecline: 'bg-[#2E271E] text-[#E0D3BC] font-bold border-[#D4AF37]/40',
      pillInactive: 'bg-[#231B10]/60 text-[#C4B495] border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:bg-[#2B2114]',
      guestActive: 'bg-[#D4AF37] text-[#18130B] font-bold border-[#D4AF37]',
      guestInactive: 'bg-[#231B10]/70 text-[#D8C7A5] border-[#D4AF37]/20 hover:border-[#D4AF37]/40',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/20',
      footnote: 'text-[#A89878]',
    },
    'dark-gold': {
      container: 'bg-[#0B1E1A]/92 border-[#D4AF37]/30 text-[#F7F5F0] shadow-[0_16px_40px_rgba(0,0,0,0.4)]',
      divider: 'bg-[#D4AF37]/35',
      sparkle: 'text-[#D4AF37]',
      title: 'text-[#F4E096]',
      subtitle: 'text-[#A3B8B5]',
      highlight: 'text-[#FAF5E6]',
      label: 'text-[#D4AF37]',
      input: 'bg-[#122722]/85 border-[#D4AF37]/25 text-[#F7F5F0] placeholder-[#7F9A93] focus:border-[#D4AF37]',
      inputIcon: 'text-[#D4AF37]/70',
      pillAccept: 'bg-[#D4AF37] text-[#0B1E1A] font-extrabold border-[#D4AF37] shadow-md shadow-[#D4AF37]/20',
      pillDecline: 'bg-[#182C27] text-[#C6D8D4] font-bold border-[#D4AF37]/40',
      pillInactive: 'bg-[#122722]/60 text-[#9BB4AF] border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:bg-[#1A342E]',
      guestActive: 'bg-[#D4AF37] text-[#0B1E1A] font-bold border-[#D4AF37]',
      guestInactive: 'bg-[#122722]/70 text-[#C6D8D4] border-[#D4AF37]/20 hover:border-[#D4AF37]/40',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/20',
      footnote: 'text-[#7F9A93]',
    },
    crimson: {
      container: 'bg-[#FFFDFB]/95 border-rose-900/20 text-[#2B1B17] shadow-[0_14px_35px_rgba(128,0,32,0.06)]',
      divider: 'bg-rose-900/25',
      sparkle: 'text-rose-800',
      title: 'text-rose-950',
      subtitle: 'text-[#6E4B43]',
      highlight: 'text-rose-950',
      label: 'text-rose-900',
      input: 'bg-white/95 border-rose-900/15 text-[#2B1B17] placeholder-[#A88E88] focus:border-rose-900',
      inputIcon: 'text-rose-900/60',
      pillAccept: 'bg-rose-900 text-white font-bold border-rose-900 shadow-md shadow-rose-900/20',
      pillDecline: 'bg-stone-700 text-white font-bold border-stone-700',
      pillInactive: 'bg-white text-[#6E4B43] border-rose-900/15 hover:border-rose-900/30 hover:bg-rose-50/40',
      guestActive: 'bg-rose-900 text-white font-bold border-rose-900',
      guestInactive: 'bg-white text-stone-700 border-rose-900/15 hover:border-rose-900/30',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/20',
      footnote: 'text-[#8C6D65]',
    },
    emerald: {
      container: 'bg-[#0E241E]/92 border-emerald-500/25 text-[#E6F4F0] shadow-[0_16px_40px_rgba(0,0,0,0.35)]',
      divider: 'bg-emerald-500/35',
      sparkle: 'text-emerald-400',
      title: 'text-emerald-100',
      subtitle: 'text-emerald-200/80',
      highlight: 'text-emerald-50',
      label: 'text-emerald-400',
      input: 'bg-[#15342C]/85 border-emerald-500/20 text-emerald-50 placeholder-emerald-300/40 focus:border-emerald-400',
      inputIcon: 'text-emerald-400/70',
      pillAccept: 'bg-emerald-600 text-white font-bold border-emerald-500 shadow-md shadow-emerald-600/30',
      pillDecline: 'bg-[#1E3E34] text-emerald-200 font-bold border-emerald-600/40',
      pillInactive: 'bg-[#15342C]/60 text-emerald-200/70 border-emerald-500/15 hover:border-emerald-400/30 hover:bg-[#1C4238]',
      guestActive: 'bg-emerald-500 text-[#0E241E] font-bold border-emerald-400',
      guestInactive: 'bg-[#15342C]/70 text-emerald-200 border-emerald-500/20 hover:border-emerald-400/30',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/25',
      footnote: 'text-emerald-300/60',
    },
    rose: {
      container: 'bg-[#FFF9F9]/95 border-rose-200/85 text-stone-800 shadow-[0_14px_35px_rgba(244,63,94,0.06)]',
      divider: 'bg-rose-300/60',
      sparkle: 'text-rose-500',
      title: 'text-rose-950',
      subtitle: 'text-stone-600',
      highlight: 'text-rose-900',
      label: 'text-rose-800',
      input: 'bg-white/95 border-rose-200/80 text-stone-800 placeholder-stone-400 focus:border-rose-400',
      inputIcon: 'text-rose-400',
      pillAccept: 'bg-rose-800 text-white font-bold border-rose-800 shadow-md shadow-rose-800/20',
      pillDecline: 'bg-stone-700 text-white font-bold border-stone-700',
      pillInactive: 'bg-white text-stone-600 border-rose-200/70 hover:border-rose-300 hover:bg-rose-50/50',
      guestActive: 'bg-rose-800 text-white font-bold border-rose-800',
      guestInactive: 'bg-white text-stone-700 border-rose-200/70 hover:border-rose-300',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/20',
      footnote: 'text-stone-500',
    },
    navy: {
      container: 'bg-[#0A1628]/92 border-amber-400/25 text-slate-100 shadow-[0_16px_40px_rgba(0,0,0,0.4)]',
      divider: 'bg-amber-400/35',
      sparkle: 'text-amber-400',
      title: 'text-amber-100',
      subtitle: 'text-slate-300',
      highlight: 'text-amber-200',
      label: 'text-amber-300',
      input: 'bg-[#11233E]/85 border-slate-700/80 text-slate-100 placeholder-slate-400 focus:border-amber-400',
      inputIcon: 'text-amber-400/70',
      pillAccept: 'bg-amber-500 text-[#0A1628] font-extrabold border-amber-400 shadow-md shadow-amber-500/20',
      pillDecline: 'bg-slate-800 text-slate-200 font-bold border-slate-700',
      pillInactive: 'bg-[#11233E]/60 text-slate-300 border-slate-700/60 hover:border-amber-400/30 hover:bg-[#172D4D]',
      guestActive: 'bg-amber-400 text-[#0A1628] font-bold border-amber-300',
      guestInactive: 'bg-[#11233E]/70 text-slate-300 border-slate-700/60 hover:border-amber-400/30',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/20',
      footnote: 'text-slate-400',
    },
    dark: {
      container: 'bg-zinc-900/92 border-amber-500/25 text-zinc-100 shadow-[0_16px_40px_rgba(0,0,0,0.5)]',
      divider: 'bg-amber-500/30',
      sparkle: 'text-amber-400',
      title: 'text-amber-100',
      subtitle: 'text-zinc-400',
      highlight: 'text-amber-200',
      label: 'text-amber-400',
      input: 'bg-zinc-800/85 border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:border-amber-400',
      inputIcon: 'text-amber-400/70',
      pillAccept: 'bg-amber-500 text-zinc-950 font-extrabold border-amber-400 shadow-md shadow-amber-500/20',
      pillDecline: 'bg-zinc-800 text-zinc-200 font-bold border-zinc-700',
      pillInactive: 'bg-zinc-950/60 text-zinc-300 border-zinc-800 hover:border-amber-500/30 hover:bg-zinc-800/70',
      guestActive: 'bg-amber-400 text-zinc-950 font-bold border-amber-300',
      guestInactive: 'bg-zinc-800/70 text-zinc-300 border-zinc-700 hover:border-amber-500/30',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/20',
      footnote: 'text-zinc-400',
    },
    light: {
      container: 'bg-white/95 border-stone-200/90 text-stone-800 shadow-[0_14px_35px_rgba(0,0,0,0.05)] backdrop-blur-sm',
      divider: 'bg-stone-300',
      sparkle: 'text-amber-500',
      title: 'text-stone-900',
      subtitle: 'text-stone-600',
      highlight: 'text-stone-900',
      label: 'text-stone-700',
      input: 'bg-stone-50/70 border-stone-200/80 text-stone-800 placeholder-stone-400 focus:border-stone-400',
      inputIcon: 'text-stone-400',
      pillAccept: 'bg-stone-900 text-white font-bold border-stone-900 shadow-md shadow-stone-900/15',
      pillDecline: 'bg-stone-200 text-stone-800 font-bold border-stone-300',
      pillInactive: 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50',
      guestActive: 'bg-stone-900 text-white font-bold border-stone-900',
      guestInactive: 'bg-stone-100 text-stone-700 border-stone-200 hover:border-stone-300',
      button: 'bg-gradient-to-r from-[#25D366] to-[#1ebe5d] hover:brightness-105 text-white shadow-lg shadow-[#25D366]/20',
      footnote: 'text-stone-500',
    },
  }
  return themes[t] ?? themes.light
})
</script>

<template>
  <section class="w-full my-8 sm:my-12 px-2 sm:px-4">
    <div class="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border p-5 sm:p-7 md:p-8 transition-all backdrop-blur-md" :class="themeClasses.container">
      <!-- Header -->
      <div class="text-center mb-5 sm:mb-6">
        <div class="inline-flex items-center justify-center gap-2 mb-2">
          <span class="h-px w-6 sm:w-8" :class="themeClasses.divider" />
          <Sparkles class="w-3.5 h-3.5" :class="themeClasses.sparkle" />
          <span class="h-px w-6 sm:w-8" :class="themeClasses.divider" />
        </div>
        <h3 class="text-lg sm:text-xl font-bold tracking-[0.2em] uppercase" :class="themeClasses.title">
          RSVP
        </h3>
        <p class="text-[11.5px] sm:text-[13px] mt-1 font-normal max-w-xs sm:max-w-sm mx-auto leading-relaxed" :class="themeClasses.subtitle">
          Kindly respond to let <span class="font-semibold" :class="themeClasses.highlight">{{ groomName }} &amp; {{ brideName }}</span> know if you can join
        </p>
      </div>

      <!-- Success State -->
      <div v-if="submitted" class="py-6 text-center space-y-3">
        <div class="w-12 h-12 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
          <CheckCircle2 class="w-6 h-6" />
        </div>
        <h4 class="text-base sm:text-lg font-bold" :class="themeClasses.title">Opening WhatsApp…</h4>
        <p class="text-xs max-w-xs mx-auto leading-relaxed" :class="themeClasses.subtitle">
          Your RSVP details are ready. If WhatsApp doesn't launch automatically, tap the button below:
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#25D366] text-white font-bold text-xs shadow-md hover:bg-[#20bd5a] transition-all active:scale-95"
          @click="handleSendRsvp"
        >
          <MessageCircle class="w-4 h-4 fill-current" /> Open WhatsApp
        </button>
        <button
          type="button"
          class="text-[11px] underline mt-1.5 opacity-70 hover:opacity-100"
          :class="themeClasses.subtitle"
          @click="submitted = false"
        >
          Send another response
        </button>
      </div>

      <!-- RSVP Form -->
      <form v-else class="space-y-3.5 text-left max-w-md mx-auto" @submit.prevent="handleSendRsvp">
        <!-- Guest Name -->
        <div>
          <label class="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5" :class="themeClasses.label">
            Your Full Name <span class="text-rose-500">*</span>
          </label>
          <div class="relative">
            <User class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" :class="themeClasses.inputIcon" />
            <input
              v-model="guestName"
              type="text"
              required
              placeholder="e.g. Sameer & Family"
              class="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm outline-none transition-all font-medium"
              :class="themeClasses.input"
            >
          </div>
          <p v-if="error" class="text-[10.5px] font-semibold text-rose-500 mt-1">{{ error }}</p>
        </div>

        <!-- Attendance Toggle -->
        <div>
          <label class="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5" :class="themeClasses.label">
            Will You Attend?
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="flex items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-2xl border text-[11.5px] sm:text-[12.5px] transition-all active:scale-[0.98]"
              :class="attending === 'yes' ? themeClasses.pillAccept : themeClasses.pillInactive"
              @click="attending = 'yes'"
            >
              <CheckCircle2 class="w-3.5 h-3.5 shrink-0" />
              <span>Joyfully Accept</span>
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-2xl border text-[11.5px] sm:text-[12.5px] transition-all active:scale-[0.98]"
              :class="attending === 'no' ? themeClasses.pillDecline : themeClasses.pillInactive"
              @click="attending = 'no'"
            >
              <XCircle class="w-3.5 h-3.5 shrink-0" />
              <span>Regretfully Decline</span>
            </button>
          </div>
        </div>

        <!-- Guest Count -->
        <div v-if="attending === 'yes'" class="pt-0.5">
          <label class="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5" :class="themeClasses.label">
            Number of Guests
          </label>
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="opt in guestCountOptions"
              :key="opt"
              type="button"
              class="py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all active:scale-95 text-center"
              :class="guestCount === opt ? themeClasses.guestActive : themeClasses.guestInactive"
              @click="guestCount = opt"
            >
              {{ opt }}
            </button>
          </div>
        </div>

        <!-- Wish -->
        <div>
          <label class="block text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] mb-1.5" :class="themeClasses.label">
            Heartfelt Wish <span class="opacity-60 lowercase font-normal">(optional)</span>
          </label>
          <textarea
            v-model="message"
            rows="2"
            placeholder="Share a blessing or note for the couple…"
            class="w-full px-3.5 py-2 sm:py-2.5 rounded-2xl border text-xs sm:text-sm outline-none transition-all font-medium resize-none leading-relaxed"
            :class="themeClasses.input"
          />
        </div>

        <!-- Submit -->
        <div class="pt-1">
          <button
            type="submit"
            class="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm tracking-wide transition-all active:scale-[0.98] group"
            :class="themeClasses.button"
          >
            <MessageCircle class="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
            <span>Send RSVP via WhatsApp</span>
            <Send class="w-3.5 h-3.5 opacity-80 transition-transform group-hover:translate-x-0.5" />
          </button>
          <p v-if="cleanPhone" class="text-[10px] text-center mt-2 font-medium tracking-wide" :class="themeClasses.footnote">
            Pre-fills message to <span class="font-semibold opacity-90">+{{ cleanPhone }}</span>
          </p>
        </div>
      </form>
    </div>
  </section>
</template>
