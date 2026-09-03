<script setup lang="ts">
import { Wand2, Type, SlidersHorizontal, Layers } from 'lucide-vue-next'
import Panel from './Panel.vue'
import PresetsPanel from './PresetsPanel.vue'
import HeroFontPanel from './HeroFontPanel.vue'
import SizePanel from './SizePanel.vue'
import SectionsPanel from './SectionsPanel.vue'
import { SECTION_PRESETS, type PresetOption } from './font-utils'

const props = defineProps<{
  fontFamily: string
  fontSize: number
  showEvents: boolean
  rsvpEnabled: boolean
}>()

const emit = defineEmits<{
  'update:fontFamily': [value: string]
  'update:fontSize': [value: number]
  'update:showEvents': [value: boolean]
  'update:rsvpEnabled': [value: boolean]
}>()

const activePanel = ref<string | null>(null)

function togglePanel(panel: string) {
  activePanel.value = activePanel.value === panel ? null : panel
}

function pickPreset(preset: PresetOption) {
  emit('update:fontFamily', preset.fontFamily)
  emit('update:fontSize', preset.fontSize)
  activePanel.value = null
}

function resetDefaults() {
  emit('update:fontFamily', 'cinzel')
  emit('update:fontSize', 14)
  activePanel.value = null
}

const tools = [
  { id: 'preset', icon: Wand2, label: 'Presets', panel: 'preset' },
  { id: 'font', icon: Type, label: 'Font', panel: 'font' },
  { id: 'size', icon: SlidersHorizontal, label: 'Size', panel: 'size' },
  { id: 'sections', icon: Layers, label: 'Sections', panel: 'sections' },
]
</script>

<template>
  <div>
    <!-- Fixed Bottom Toolbar -->
    <div class="fixed bottom-0 left-0 right-0 z-[95] pointer-events-auto">
      <div class="max-w-md mx-auto px-3 pb-[max(env(safe-area-inset-bottom,0px),8px)]">
        <div
          class="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] border border-gray-200/60 p-2 flex items-center justify-between gap-1.5 sm:gap-2"
        >
          <button
            v-for="tool in tools"
            :key="tool.id"
            class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-1 min-w-0 cursor-pointer"
            :class="
              activePanel === tool.panel
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
            "
            @click="togglePanel(tool.panel)"
          >
            <component :is="tool.icon" class="w-5 h-5 shrink-0" :stroke-width="activePanel === tool.panel ? 2.5 : 2" />
            <span class="text-[11px] font-bold leading-none truncate">{{ tool.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Panels -->
    <Panel :open="activePanel === 'preset'" title="1-Tap Style Presets" @close="activePanel = null">
      <PresetsPanel
        :current-font="fontFamily"
        :current-size="fontSize"
        @pick="pickPreset"
        @reset="resetDefaults"
      />
    </Panel>

    <Panel :open="activePanel === 'font'" title="Font Family" @close="activePanel = null">
      <HeroFontPanel :current-font="fontFamily" @select="(id) => emit('update:fontFamily', id)" />
    </Panel>

    <Panel :open="activePanel === 'size'" title="Global Text Size" @close="activePanel = null">
      <SizePanel :current-size="fontSize" @change="(v) => emit('update:fontSize', v)" />
    </Panel>

    <Panel :open="activePanel === 'sections'" title="Sections & Visibility" @close="activePanel = null">
      <SectionsPanel
        :show-photo="true"
        :show-events="showEvents"
        :rsvp-enabled="rsvpEnabled"
        @update:showEvents="(v) => emit('update:showEvents', v)"
        @update:rsvpEnabled="(v) => emit('update:rsvpEnabled', v)"
      />
    </Panel>
  </div>
</template>
