const GOOGLE_MAPS_HOSTS = [
  'google.com',
  'maps.google.com',
  'maps.app.goo.gl',
  'goo.gl',
]

const SHORT_LINK_HOSTS = ['maps.app.goo.gl', 'goo.gl']

/**
 * Check whether a URL points to Google Maps.
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  if (!url.trim()) return false
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\./, '')
    if (GOOGLE_MAPS_HOSTS.some((h) => host === h || host.endsWith('.' + h))) return true
    if (host.endsWith('google') && u.pathname.includes('/maps')) return true
    return false
  } catch {
    return false
  }
}

/**
 * Returns true for short-link domains that redirect (maps.app.goo.gl, goo.gl).
 * These cannot be parsed for place info and cannot be embedded in iframes.
 */
export function isShortGoogleMapsLink(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return SHORT_LINK_HOSTS.some((h) => host === h || host.endsWith('.' + h))
  } catch {
    return false
  }
}

function decodePlaceFromPath(pathname: string): string | null {
  const match = pathname.match(/\/maps\/place\/([^/@]+)/)
  if (match?.[1]) return decodeURIComponent(match[1].replace(/\+/g, ' '))
  return null
}

function decodeSearchFromPath(pathname: string): string | null {
  const match = pathname.match(/\/maps\/search\/([^/@]+)/)
  if (match?.[1]) return decodeURIComponent(match[1].replace(/\+/g, ' '))
  return null
}

function decodeDirFromPath(pathname: string): string | null {
  const match = pathname.match(/\/maps\/dir\/([^/@]+)\/([^/@]+)/)
  if (match?.[1] && match?.[2]) {
    const from = decodeURIComponent(match[1].replace(/\+/g, ' '))
    const to = decodeURIComponent(match[2].replace(/\+/g, ' '))
    return `${from} to ${to}`
  }
  return null
}

function extractQuery(u: URL): string | null {
  if (u.pathname.includes('/maps/place/')) return decodePlaceFromPath(u.pathname)
  if (u.pathname.includes('/maps/search/')) return decodeSearchFromPath(u.pathname)
  if (u.pathname.includes('/maps/dir/')) return decodeDirFromPath(u.pathname)

  const q = u.searchParams.get('q') ?? u.searchParams.get('query')
  if (q) return q

  const coordsMatch = u.pathname.match(/\/maps\/@([-\d.]+),([-\d.]+)/)
  if (coordsMatch?.[1] && coordsMatch?.[2]) return `${coordsMatch[1]},${coordsMatch[2]}`

  return null
}

function embedUrlFromQuery(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
}

/**
 * Convert any Google Maps URL to an embeddable iframe src.
 *
 * - Short links (maps.app.goo.gl, goo.gl/maps) cannot be embedded —
 *   use isShortGoogleMapsLink() to detect them and show a fallback.
 * - Embed-ready URLs (/maps/embed?pb=...) are returned as-is.
 * - All other formats are parsed and converted to a fallback embed URL.
 */
export function googleMapsEmbedUrl(url: string): string {
  if (!url.trim()) return ''
  const trimmed = url.trim()

  if (isShortGoogleMapsLink(trimmed)) return ''

  try {
    const u = new URL(trimmed)
    if (u.pathname.includes('/maps/embed')) return trimmed

    const query = extractQuery(u)
    if (query) return embedUrlFromQuery(query)

    return embedUrlFromQuery(trimmed)
  } catch {
    return embedUrlFromQuery(trimmed)
  }
}

/**
 * Build a Google Maps "open" link that always works in a new tab.
 * Useful for a fallback button when the embed fails to load.
 */
export function googleMapsOpenUrl(url: string): string {
  if (!url.trim()) return '#'
  const trimmed = url.trim()
  if (isShortGoogleMapsLink(trimmed)) return trimmed

  try {
    const u = new URL(trimmed)
    const query = extractQuery(u)
    if (query) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    return trimmed
  } catch {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
  }
}
