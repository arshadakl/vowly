import { TEMPLATE_DEFINITIONS, type TemplateId } from '@vowly/types'

export const templateDefinitions = TEMPLATE_DEFINITIONS

const templateComponents: Record<TemplateId, () => Promise<any>> = {
  'standard-crimson': () => import('~/components/templates/wedding/StandardCrimsonTemplate.vue'),
  'royal-nikah': () => import('~/components/templates/wedding/RoyalNikahTemplate.vue'),
  'royal-postcard': () => import('~/components/templates/wedding/RoyalPostcardTemplate.vue'),
  'premium-floral': () => import('~/components/templates/wedding/PremiumFloralTemplate.vue'),
  'watercolor-bliss': () => import('~/components/templates/wedding/WatercolorBlissTemplate.vue'),
  'kerala-kasavu': () => import('~/components/templates/wedding/KeralaKasavuTemplate.vue'),
  'ivory-arch': () => import('~/components/templates/wedding/IvoryArchTemplate.vue'),
  'modern-navy': () => import('~/components/templates/wedding/ModernNavyTemplate.vue'),
  'black-gold-silhouette': () => import('~/components/templates/wedding/BlackGoldSilhouetteTemplate.vue'),
  'burgundy-embossed': () => import('~/components/templates/wedding/BurgundyEmbossedTemplate.vue'),
  'golden-yellow-namaste': () => import('~/components/templates/wedding/GoldenYellowNamasteTemplate.vue'),
  'jasmine-garland-south': () => import('~/components/templates/wedding/JasmineGarlandSouthTemplate.vue'),
  'kerala-lotus-tradition': () => import('~/components/templates/wedding/KeralaLotusTraditionTemplate.vue'),
  'lavender-blush-proposal': () => import('~/components/templates/wedding/LavenderBlushProposalTemplate.vue'),
  'maroon-arch-islamic': () => import('~/components/templates/wedding/MaroonArchIslamicTemplate.vue'),
  'maroon-mandala-classic': () => import('~/components/templates/wedding/MaroonMandalaClassicTemplate.vue'),
  'pearl-blush-elegant': () => import('~/components/templates/wedding/PearlBlushElegantTemplate.vue'),
  'peony-romance': () => import('~/components/templates/wedding/PeonyRomanceTemplate.vue'),
  'pink-rose-sofa-romance': () => import('~/components/templates/wedding/PinkRoseSofaRomanceTemplate.vue'),
  'red-gold-bridal': () => import('~/components/templates/wedding/RedGoldBridalTemplate.vue'),
  'romantic-blush': () => import('~/components/templates/wedding/RomanticBlushTemplate.vue'),
  'rose-gold-temple': () => import('~/components/templates/wedding/RoseGoldTempleTemplate.vue'),
  'sage-gold-harmony': () => import('~/components/templates/wedding/SageGoldHarmonyTemplate.vue'),
  'teal-gold-embrace': () => import('~/components/templates/wedding/TealGoldEmbraceTemplate.vue'),
  'temple-gopuram-heritage': () => import('~/components/templates/wedding/TempleGopuramHeritageTemplate.vue'),
}

export { templateComponents }
