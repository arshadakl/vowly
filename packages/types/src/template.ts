import { z } from 'zod'

export const TEMPLATE_IDS = [
  'standard-crimson',
  'royal-nikah',
  'royal-postcard',
  'premium-floral',
  'watercolor-bliss',
  'kerala-kasavu',
  'ivory-arch',
  'modern-navy',
  'black-gold-silhouette',
  'burgundy-embossed',
  'golden-yellow-namaste',
  'jasmine-garland-south',
  'kerala-lotus-tradition',
  'lavender-blush-proposal',
  'maroon-arch-islamic',
  'maroon-mandala-classic',
  'pearl-blush-elegant',
  'peony-romance',
  'pink-rose-sofa-romance',
  'red-gold-bridal',
  'romantic-blush',
  'rose-gold-temple',
  'sage-gold-harmony',
  'teal-gold-embrace',
  'temple-gopuram-heritage',
] as const

export const templateIdSchema = z.enum(TEMPLATE_IDS)
export type TemplateId = z.infer<typeof templateIdSchema>

export const TEMPLATE_FONT_IDS = [
  'cinzel',
  'cormorant',
  'italiana',
  'pinyon',
  'alex',
  'jost',
  'jakarta',
  'amiri',
  'malayalam',
  'greatVibes',
  'lora',
  'montserrat',
  'playfair',
  'allura',
] as const
export const templateFontIdSchema = z.enum(TEMPLATE_FONT_IDS)
export type TemplateFontId = z.infer<typeof templateFontIdSchema>

export const templateTextStyleSchema = z.object({
  sizeDelta: z.number().int().min(-8).max(12).default(0),
  bold: z.boolean().default(false),
  italic: z.boolean().default(false),
})
export type TemplateTextStyle = z.infer<typeof templateTextStyleSchema>

export const templateCustomizationSchema = z.object({
  version: z.literal(1).default(1),
  fontFamily: templateFontIdSchema.default('cinzel'),
  fontSize: z.number().int().min(12).max(26).default(14),
  showEvents: z.boolean().default(true),
  musicEnabled: z.boolean().default(false),
  text: z.record(z.string().max(80), z.string().max(500)).default({}),
  styles: z.record(z.string().max(80), templateTextStyleSchema).default({}),
})
export type TemplateCustomization = z.infer<typeof templateCustomizationSchema>

export const DEFAULT_TEMPLATE_CUSTOMIZATION: TemplateCustomization = {
  version: 1,
  fontFamily: 'cinzel',
  fontSize: 14,
  showEvents: true,
  musicEnabled: false,
  text: {},
  styles: {},
}

export interface TemplateOgTheme {
  background: string
  foreground: string
  accent: string
}

export type TemplateFamily = 'bespoke' | 'portrait'

export interface TemplateDefinition {
  id: TemplateId
  name: string
  description: string
  culture: string
  family: TemplateFamily
  motif: string
  previewGradient: string
  /** Reference preview image used by the template gallery. */
  backgroundImage: string
  ogTheme: TemplateOgTheme
  /** Primary font family for this template */
  primaryFont?: string
  /** Script/cursive font for decorative text */
  scriptFont?: string
}

const TEMPLATE_BACKGROUND_IMAGES: Record<TemplateId, string> = {
  'standard-crimson': 'https://one-tawny-two.vercel.app/0001/img/crimson-scroll-bg.webp',
  'royal-nikah': 'https://i.pinimg.com/474x/24/0f/5b/240f5bef281adfd33597e641f448654f.jpg',
  'royal-postcard': '/templates/previews/postcard-invitation.png',
  'premium-floral': 'https://one-tawny-two.vercel.app/0005/img/floral-arch-thumb.jpg',
  'watercolor-bliss':
    'https://one-tawny-two.vercel.app/0007/Beige%20and%20Pink%20Watercolor%20Wedding%20Invitation.png',
  'kerala-kasavu': '/templates/previews/kerala-invitation.png',
  'ivory-arch': 'https://one-tawny-two.vercel.app/0008/img/ivory-arch-thumb.jpg',
  'modern-navy':
    'https://one-tawny-two.vercel.app/0009/Blue%20Watercolor%20Illustration%20Wedding%20Invitation.png',
  'black-gold-silhouette':
    'https://i.pinimg.com/736x/a7/33/41/a7334147da51bbc26c3e278c65d54c08.jpg',
  'burgundy-embossed': 'https://i.pinimg.com/736x/d7/5d/0b/d75d0bcd3f428725a323c43c3c37d7ca.jpg',
  'golden-yellow-namaste':
    'https://i.pinimg.com/1200x/25/d0/c4/25d0c4cb78faf6d2f42fea9bac44fd24.jpg',
  'jasmine-garland-south':
    'https://i.pinimg.com/1200x/67/e1/59/67e1596c45e1a0b3229b8830a297a1a7.jpg',
  'kerala-lotus-tradition':
    'https://i.pinimg.com/736x/01/7c/a4/017ca4d93a0f295f0e1d1bc3b4199be0.jpg',
  'lavender-blush-proposal':
    'https://i.pinimg.com/736x/7a/6e/06/7a6e06b270dc24eb85fb83113f9c6c6c.jpg',
  'maroon-arch-islamic': 'https://i.pinimg.com/736x/5f/69/24/5f6924a1348ea74e7d454723f4309edb.jpg',
  'maroon-mandala-classic':
    'https://i.pinimg.com/736x/5a/c7/4e/5ac74e649a2696ae89c9d37dd124f913.jpg',
  'pearl-blush-elegant': 'https://i.pinimg.com/736x/65/3e/a3/653ea3522b0f8f4aa8be649eba8dd7d7.jpg',
  'peony-romance': 'https://i.pinimg.com/736x/ae/07/6f/ae076f97dede906b6075a21619838ec0.jpg',
  'pink-rose-sofa-romance':
    'https://i.pinimg.com/736x/d1/83/eb/d183ebc18088cbaf6163aa5787a865e1.jpg',
  'red-gold-bridal': 'https://i.pinimg.com/736x/fa/9c/ac/fa9cac1813abf59df06e52698420ecea.jpg',
  'romantic-blush': 'https://i.pinimg.com/736x/fc/de/91/fcde911ed948280ff339ff1701382479.jpg',
  'rose-gold-temple': 'https://i.pinimg.com/736x/02/6e/13/026e13fa9252f8650f9f2be2e027f0e8.jpg',
  'sage-gold-harmony': 'https://i.pinimg.com/736x/8a/fa/e2/8afae2680457d0877f464dab7b4f3240.jpg',
  'teal-gold-embrace': 'https://i.pinimg.com/736x/d1/04/c0/d104c0c0e30ac0955cbfc0f1757a95fa.jpg',
  'temple-gopuram-heritage':
    'https://i.pinimg.com/736x/94/3f/eb/943feb4f2e40b3354546af2989ab64ed.jpg',
}

const template = (
  id: TemplateId,
  name: string,
  description: string,
  culture: string,
  family: TemplateFamily,
  motif: string,
  background: string,
  foreground: string,
  accent: string,
  primaryFont?: string,
  scriptFont?: string,
): TemplateDefinition => ({
  id,
  name,
  description,
  culture,
  family,
  motif,
  previewGradient: `linear-gradient(145deg, ${background}, ${accent})`,
  backgroundImage: TEMPLATE_BACKGROUND_IMAGES[id],
  ogTheme: { background, foreground, accent },
  primaryFont,
  scriptFont,
})

export const TEMPLATE_DEFINITIONS: readonly TemplateDefinition[] = [
  template(
    'standard-crimson',
    'Standard Crimson',
    'Crimson velvet, ivory and antique gold.',
    'Classic',
    'bespoke',
    '❈',
    '#fff8ef',
    '#4b0d18',
    '#a73543',
    'Cinzel',
  ),
  template(
    'royal-nikah',
    'Royal Nikah',
    'Emerald arches with refined Islamic details.',
    'Nikah',
    'bespoke',
    '☾',
    '#071d19',
    '#f7edcf',
    '#b99045',
    'Cinzel',
  ),
  template(
    'royal-postcard',
    'Royal Postcard',
    'A warm illustrated keepsake with postal charm.',
    'Romantic',
    'bespoke',
    '♡',
    '#f9eadf',
    '#5d2e2d',
    '#c47d69',
    'Cinzel',
    'Alex Brush',
  ),
  template(
    'premium-floral',
    'Premium Floral',
    'Dramatic botanicals with luminous gold type.',
    'Floral',
    'bespoke',
    '✿',
    '#17120d',
    '#fff6dd',
    '#b68b42',
    'Cinzel',
    'Allura',
  ),
  template(
    'watercolor-bliss',
    'Watercolor Bliss',
    'Soft painted florals and airy editorial type.',
    'Contemporary',
    'bespoke',
    '✾',
    '#edf5ef',
    '#193d31',
    '#88a996',
    'Lora',
    'Great Vibes',
  ),
  template(
    'kerala-kasavu',
    'Kerala Kasavu',
    'Ivory, kasavu gold and Kerala heritage motifs.',
    'Kerala',
    'bespoke',
    '❀',
    '#fffaf0',
    '#4d251d',
    '#c49332',
    'Cormorant Garamond',
  ),
  template(
    'ivory-arch',
    'Ivory Arch',
    'Sculptural ivory arches and quiet luxury.',
    'Modern',
    'bespoke',
    '⌒',
    '#f7efe6',
    '#302027',
    '#b58b74',
    'Playfair Display',
    'Great Vibes',
  ),
  template(
    'modern-navy',
    'Modern Navy',
    'Midnight blue, clean geometry and champagne accents.',
    'Modern',
    'bespoke',
    '◇',
    '#09172e',
    '#f5eddc',
    '#c2a572',
    'Montserrat',
    'Great Vibes',
  ),
  template(
    'black-gold-silhouette',
    'Black Gold Silhouette',
    'Cinematic black with radiant gold silhouettes.',
    'Luxury',
    'portrait',
    '✦',
    '#090909',
    '#fff7dd',
    '#c9952e',
    'Cinzel',
  ),
  template(
    'burgundy-embossed',
    'Burgundy Embossed',
    'Deep wine tones with embossed ornament.',
    'Classic',
    'portrait',
    '❖',
    '#3a0b18',
    '#fff3dc',
    '#a64e62',
    'Cinzel',
  ),
  template(
    'golden-yellow-namaste',
    'Golden Yellow Namaste',
    'Joyful marigold color and festive warmth.',
    'Indian',
    'portrait',
    'ॐ',
    '#fff3b0',
    '#5c2c06',
    '#d69423',
    'Cormorant Garamond',
  ),
  template(
    'jasmine-garland-south',
    'Jasmine Garland South',
    'Jasmine garlands and vivid South Indian color.',
    'South Indian',
    'portrait',
    '❀',
    '#fff4f6',
    '#651431',
    '#d45e86',
    'Cormorant Garamond',
  ),
  template(
    'kerala-lotus-tradition',
    'Kerala Lotus Tradition',
    'Lotus details in traditional Kerala ivory and gold.',
    'Kerala',
    'portrait',
    '✿',
    '#fff8e9',
    '#562a17',
    '#c47a35',
    'Cormorant Garamond',
  ),
  template(
    'lavender-blush-proposal',
    'Lavender Blush Proposal',
    'Dreamy lavender with a delicate proposal mood.',
    'Romantic',
    'portrait',
    '♡',
    '#f4edff',
    '#402b59',
    '#9b7aca',
    'Playfair Display',
  ),
  template(
    'maroon-arch-islamic',
    'Maroon Arch Islamic',
    'Layered Islamic arches in rich maroon.',
    'Nikah',
    'portrait',
    '☾',
    '#3b0c1b',
    '#fff3de',
    '#b36b72',
    'Cinzel',
  ),
  template(
    'maroon-mandala-classic',
    'Maroon Mandala Classic',
    'Classic mandalas with ceremonial depth.',
    'Indian',
    'portrait',
    '❂',
    '#430d1b',
    '#fff1d8',
    '#b56b4f',
    'Cinzel',
  ),
  template(
    'pearl-blush-elegant',
    'Pearl Blush Elegant',
    'Pearl neutrals and restrained blush details.',
    'Elegant',
    'portrait',
    '◌',
    '#fbf6f2',
    '#3b2e2b',
    '#d7aaa1',
    'Cormorant Garamond',
  ),
  template(
    'peony-romance',
    'Peony Romance',
    'Abundant peonies with a romantic editorial finish.',
    'Floral',
    'portrait',
    '✾',
    '#fff1f3',
    '#5f2434',
    '#c95e78',
    'Cormorant Garamond',
  ),
  template(
    'pink-rose-sofa-romance',
    'Pink Rose Sofa Romance',
    'Rose-pink celebration with portrait drama.',
    'Romantic',
    'portrait',
    '❁',
    '#fdecef',
    '#642139',
    '#e2779b',
    'Playfair Display',
  ),
  template(
    'red-gold-bridal',
    'Red Gold Bridal',
    'Bridal red layered with ceremonial gold.',
    'Indian',
    'portrait',
    '✥',
    '#680e16',
    '#fff2d0',
    '#d6a43b',
    'Cormorant Garamond',
  ),
  template(
    'romantic-blush',
    'Romantic Blush',
    'Gentle blush gradients and modern romance.',
    'Romantic',
    'portrait',
    '♥',
    '#fff3f4',
    '#5d2d35',
    '#dc8795',
    'Cormorant Garamond',
  ),
  template(
    'rose-gold-temple',
    'Rose Gold Temple',
    'Temple architecture softened with rose gold.',
    'South Indian',
    'portrait',
    '⌂',
    '#fff1eb',
    '#642431',
    '#c57d72',
    'Cinzel',
  ),
  template(
    'sage-gold-harmony',
    'Sage Gold Harmony',
    'Botanical sage grounded by warm metallic accents.',
    'Botanical',
    'portrait',
    '☘',
    '#ecf2e9',
    '#213f33',
    '#9f8a45',
    'Playfair Display',
  ),
  template(
    'teal-gold-embrace',
    'Teal Gold Embrace',
    'Jewel-toned teal with a polished gold glow.',
    'Luxury',
    'portrait',
    '✧',
    '#073b3d',
    '#f8efd2',
    '#c79c47',
    'Cormorant Garamond',
  ),
  template(
    'temple-gopuram-heritage',
    'Temple Gopuram Heritage',
    'A heritage gopuram composition in earthy gold.',
    'South Indian',
    'portrait',
    '✣',
    '#fff0d5',
    '#5a2a14',
    '#b66b2a',
    'Cinzel',
  ),
] as const

export function getTemplateDefinition(id: TemplateId): TemplateDefinition {
  const definition = TEMPLATE_DEFINITIONS.find((item) => item.id === id)
  if (!definition) throw new Error(`Unknown template: ${id}`)
  return definition
}
