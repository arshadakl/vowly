const FONT_CSS_MAP: Record<string, string> = {
  cinzel: "'Cinzel', serif",
  cormorant: "'Cormorant Garamond', serif",
  italiana: "'Italiana', serif",
  pinyon: "'Pinyon Script', cursive",
  alex: "'Alex Brush', cursive",
  jost: "'Jost', sans-serif",
  jakarta: "'Plus Jakarta Sans', sans-serif",
  amiri: "'Amiri', serif",
  malayalam: "'Noto Serif Malayalam', serif",
  greatVibes: "'Great Vibes', cursive",
  lora: "'Lora', Georgia, serif",
  montserrat: "'Montserrat', sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  allura: "'Allura', cursive",
}

export function fontIdToCss(fontId: string | undefined | null): string {
  return FONT_CSS_MAP[fontId ?? ''] ?? "'Cinzel', serif"
}
