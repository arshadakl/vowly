<script setup lang="ts">
import type { PublicInvitation } from '@vowly/types'
import BurgundyHero from './BurgundyHero.vue'
import BurgundyCountdown from './BurgundyCountdown.vue'
import BurgundyEvents from './BurgundyEvents.vue'
import BurgundyVenue from './BurgundyVenue.vue'
import BurgundyShare from './BurgundyShare.vue'
import BurgundyFooter from './BurgundyFooter.vue'

defineProps<{ invitation: PublicInvitation }>()
</script>

<template>
  <article class="@container w-full relative min-h-screen bg-texture font-sans-lato text-gold-200 antialiased selection:bg-gold-400 selection:text-burgundy-900">
    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-burgundy-900/85 pointer-events-none"></div>
    
    <!-- Central Content Wrapper -->
    <div class="relative z-10 mx-auto max-w-7xl px-4 @sm:px-6 @lg:px-8 pb-20">
      <BurgundyHero :invitation="invitation" />
      <BurgundyCountdown :invitation="invitation" />
      <BurgundyEvents :invitation="invitation" />
      <BurgundyVenue :invitation="invitation" />
      <BurgundyShare :invitation="invitation" />
      <BurgundyFooter :invitation="invitation" />
    </div>
  </article>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Great+Vibes&family=Lato:wght@300;400;700&display=swap');

/* Add custom styles here rather than globally if they are template specific */
.bg-texture {
  background-color: var(--color-burgundy-900);
  background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuADg5AWlYCFu5kVUrwyvyec9mchKa_S4vdLh0OWwODgXuWh-zFFiMYggR-UOnQGld4gAT1HMDBWDNhqVLmrnBFmZ0oFCN2EUgjFgVIvXSRe-e5fK26tNba4dwaMGxUqaaiMk_9Wi71IaQDyj9tokTIvsMdCNI-dXTmoABbTpvbB48Dxow7F6YCm6qE1lh8SKLtzVIrUUT1KEinaRSHdVSvSMubGLM8vP7XA1MzcW9CAcYsjlkLUzk2_hz5gPlS6N4X7mA');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

.glass-panel {
  background: rgba(74, 21, 35, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(212, 175, 55, 0.6);
}

.gold-gradient-text {
  background: linear-gradient(to right, #f0dfa8, #d4af37, #f0dfa8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.arch-border {
  border: 2px solid var(--color-gold-400);
  border-radius: 200px 200px 0 0;
  position: relative;
}

@media (min-width: 768px) {
  .arch-border {
    border-radius: 300px 300px 0 0;
  }
}

.ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ornament::before, .ornament::after {
  content: '';
  height: 1px;
  width: 30px;
  background: var(--color-gold-400);
}

.fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
