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

export interface TemplateEvent {
  id: string
  venue?: string | null
  address?: string | null
  googleMapUrl?: string | null
  startTime?: string | null
  endTime?: string | null
}

export function getFeaturedVenueEvent<T extends TemplateEvent>(
  events: T[] | undefined,
  featuredVenueEventId: string | null | undefined,
): T | undefined {
  if (!events?.length) return undefined
  if (featuredVenueEventId) {
    const featured = events.find((e) => e.id === featuredVenueEventId)
    if (featured) return featured
  }
  return events[0]
}
