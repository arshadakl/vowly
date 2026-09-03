<script setup lang="ts">
import { Image, CalendarCheck, MessageCircle, Upload } from 'lucide-vue-next'

defineProps<{
  showPhoto: boolean
  showEvents: boolean
  rsvpEnabled: boolean
}>()

const emit = defineEmits<{
  'update:showPhoto': [value: boolean]
  'update:showEvents': [value: boolean]
  'update:rsvpEnabled': [value: boolean]
}>()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between pb-0.5">
      <p class="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
        Toggle Sections On or Off
      </p>
      <span class="text-[10px] font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
        {{ [showPhoto, showEvents, rsvpEnabled].filter(Boolean).length }} of 3 Visible
      </span>
    </div>

    <!-- Couple Photo -->
    <div
      class="rounded-2xl border-2 p-4 transition-all"
      :class="showPhoto ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-white'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="showPhoto ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'"
          >
            <Image class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">Couple Photo</p>
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {{ showPhoto ? 'Visible' : 'Hidden' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-12 h-7 rounded-full transition-all flex items-center px-0.5"
          :class="showPhoto ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'"
          @click="emit('update:showPhoto', !showPhoto)"
        >
          <div class="w-6 h-6 rounded-full bg-white shadow-sm" />
        </button>
      </div>
    </div>

    <!-- Celebrations Program -->
    <div
      class="rounded-2xl border-2 p-4 transition-all"
      :class="showEvents ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-white'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="showEvents ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'"
          >
            <CalendarCheck class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">Celebrations Program</p>
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {{ showEvents ? 'Visible' : 'Hidden' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-12 h-7 rounded-full transition-all flex items-center px-0.5"
          :class="showEvents ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'"
          @click="emit('update:showEvents', !showEvents)"
        >
          <div class="w-6 h-6 rounded-full bg-white shadow-sm" />
        </button>
      </div>
    </div>

    <!-- RSVP -->
    <div
      class="rounded-2xl border-2 p-4 transition-all"
      :class="rsvpEnabled ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100 bg-white'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="rsvpEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'"
          >
            <MessageCircle class="w-5 h-5" />
          </div>
          <div>
            <p class="text-sm font-bold text-slate-900">WhatsApp RSVP</p>
            <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              {{ rsvpEnabled ? 'Enabled' : 'Disabled' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          class="w-12 h-7 rounded-full transition-all flex items-center px-0.5"
          :class="rsvpEnabled ? 'bg-emerald-500 justify-end' : 'bg-gray-200 justify-start'"
          @click="emit('update:rsvpEnabled', !rsvpEnabled)"
        >
          <div class="w-6 h-6 rounded-full bg-white shadow-sm" />
        </button>
      </div>
    </div>
  </div>
</template>
