export interface FontOption {
  id: string
  name: string
  family: string
  style: 'serif' | 'sans' | 'cursive'
  label: string
}

export const FONT_OPTIONS: FontOption[] = [
  { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif", style: 'serif', label: 'Classic' },
  { id: 'cormorant', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", style: 'serif', label: 'Elegant' },
  { id: 'italiana', name: 'Italiana', family: "'Italiana', serif", style: 'serif', label: 'Italian' },
  { id: 'pinyon', name: 'Pinyon Script', family: "'Pinyon Script', cursive", style: 'cursive', label: 'Script' },
  { id: 'alex', name: 'Alex Brush', family: "'Alex Brush', cursive", style: 'cursive', label: 'Brush' },
  { id: 'jost', name: 'Jost', family: "'Jost', sans-serif", style: 'sans', label: 'Modern' },
  { id: 'jakarta', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", style: 'sans', label: 'Clean' },
  { id: 'amiri', name: 'Amiri', family: "'Amiri', serif", style: 'serif', label: 'Arabic' },
  { id: 'malayalam', name: 'Noto Serif Malayalam', family: "'Noto Serif Malayalam', serif", style: 'serif', label: 'Malayalam' },
  { id: 'greatVibes', name: 'Great Vibes', family: "'Great Vibes', cursive", style: 'cursive', label: 'Script' },
  { id: 'lora', name: 'Lora', family: "'Lora', Georgia, serif", style: 'serif', label: 'Body' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", style: 'sans', label: 'Clean' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', Georgia, serif", style: 'serif', label: 'Display' },
  { id: 'allura', name: 'Allura', family: "'Allura', cursive", style: 'cursive', label: 'Script' },
]

export const FONT_SIZES = [
  { label: 'S', value: 14, description: 'Small' },
  { label: 'M', value: 16, description: 'Medium' },
  { label: 'L', value: 18, description: 'Large' },
  { label: 'XL', value: 20, description: 'Extra Large' },
  { label: 'XXL', value: 22, description: 'Display' },
]

export interface PresetOption {
  id: string
  name: string
  tagline: string
  fontFamily: string
  fontSize: number
  accent: string
}

export const SECTION_PRESETS: PresetOption[] = [
  { id: 'classic', name: 'Classic Royal', tagline: 'Timeless serif, balanced spacing', fontFamily: 'cinzel', fontSize: 14, accent: 'from-amber-400 to-rose-500' },
  { id: 'romantic', name: 'Romantic Script', tagline: 'Brush-script names, soft body', fontFamily: 'alex', fontSize: 14, accent: 'from-pink-400 to-fuchsia-500' },
  { id: 'modern', name: 'Modern Minimal', tagline: 'Clean sans-serif, tight type', fontFamily: 'jost', fontSize: 14, accent: 'from-slate-400 to-emerald-500' },
  { id: 'elegant', name: 'Elegant Didot', tagline: 'Hairline serifs, luxury look', fontFamily: 'italiana', fontSize: 14, accent: 'from-indigo-400 to-amber-400' },
  { id: 'festive', name: 'Festive Bold', tagline: 'Larger names, bolder impact', fontFamily: 'cormorant', fontSize: 14, accent: 'from-orange-400 to-red-500' },
]

export function fontIdToCss(fontId: string): string {
  return FONT_OPTIONS.find((f) => f.id === fontId)?.family ?? "'Cinzel', serif"
}

export function getFontOption(fontId: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === fontId) ?? FONT_OPTIONS[0]!
}

export function getEditorCSSVars(settings: {
  fontFamily?: string
  fontSize?: number
} = {}) {
  const fontId = settings.fontFamily || 'cinzel'
  const sizeNum = Number(settings.fontSize) || 14
  const font = getFontOption(fontId)
  const fontScale = (sizeNum / 14).toFixed(4)

  return {
    '--editor-hero-font-family': font.family,
    '--editor-font-size': `${sizeNum}px`,
    '--editor-font-scale': fontScale,
  }
}
