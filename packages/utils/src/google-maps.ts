/**
 * Production-grade Google Maps URL parser and embed generator.
 *
 * Supports:
 * - Standard Google Maps URLs (place, search, direction, @coords)
 * - Short links (maps.app.goo.gl, goo.gl) — detected, not resolved client-side
 * - Coordinate extraction from @lat,lng and query params
 * - Place name extraction from /maps/place/ paths
 * - Embed URL generation for iframes (no API key needed for basic embeds)
 * - Open URL generation that always works in a new tab
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GoogleMapResult {
  valid: boolean
  type: 'short' | 'place' | 'search' | 'coordinates' | 'direction' | 'unknown'
  originalUrl: string
  name?: string
  lat?: number
  lng?: number
  placeId?: string
  embedUrl: string
  openUrl: string
  error?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHORT_LINK_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl'])

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.hostname
  } catch {
    return false
  }
}

function isGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  if (SHORT_LINK_HOSTS.has(host)) return true
  if (host === 'google.com' || host === 'www.google.com' || host === 'maps.google.com') return true
  return host.endsWith('.google.com') || host.endsWith('.googleusercontent.com')
}

function isGoogleMapsUrl(url: URL): boolean {
  return isGoogleMapsHost(url.hostname)
}

function extractCoordinates(url: URL): { lat: number; lng: number } | undefined {
  // /@11.1215847,76.2887387,1133m or /@11.1215847,76.2887387
  const atMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    return { lat: Number(atMatch[1]), lng: Number(atMatch[2]) }
  }

  // ?query=11.1215847,76.2887387 or ?q=11.1215847,76.2887387
  const query = url.searchParams.get('query') ?? url.searchParams.get('q')
  if (query) {
    const queryMatch = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
    if (queryMatch) {
      return { lat: Number(queryMatch[1]), lng: Number(queryMatch[2]) }
    }
  }

  // ?ll=27.1751,78.0421
  const ll = url.searchParams.get('ll')
  if (ll) {
    const llMatch = ll.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
    if (llMatch) {
      return { lat: Number(llMatch[1]), lng: Number(llMatch[2]) }
    }
  }

  return undefined
}

function extractPlaceId(url: URL): string | undefined {
  return url.searchParams.get('query_place_id') ?? url.searchParams.get('place_id') ?? undefined
}

function extractPlaceName(url: URL): string | undefined {
  const match = url.pathname.match(/\/maps\/place\/([^/@]+)/i)
  if (!match?.[1]) return undefined
  try {
    return decodeURIComponent(match[1]).replace(/\+/g, ' ')
  } catch {
    return undefined
  }
}

function extractSearchQuery(url: URL): string | undefined {
  const match = url.pathname.match(/\/maps\/search\/([^/@]+)/i)
  if (!match?.[1]) return undefined
  try {
    return decodeURIComponent(match[1]).replace(/\+/g, ' ')
  } catch {
    return undefined
  }
}

function extractQueryName(url: URL): string | undefined {
  const q = url.searchParams.get('q')
  if (!q) return undefined
  // Don't return coordinate-only queries as names
  if (/^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/.test(q)) return undefined
  try {
    return decodeURIComponent(q).replace(/\+/g, ' ')
  } catch {
    return undefined
  }
}

function classifyUrl(url: URL): GoogleMapResult['type'] {
  const host = url.hostname.toLowerCase()

  if (SHORT_LINK_HOSTS.has(host)) return 'short'
  if (/\/maps\/place\//i.test(url.pathname)) return 'place'
  if (/\/maps\/search/i.test(url.pathname)) return 'search'
  if (/\/maps\/dir\//i.test(url.pathname)) return 'direction'
  if (extractCoordinates(url)) return 'coordinates'

  // maps.google.com/?q=... without /maps/ path
  if (host === 'maps.google.com' && (url.searchParams.get('q') || url.searchParams.get('query'))) {
    return 'search'
  }

  return 'unknown'
}

function buildEmbedUrl(url: URL, type: GoogleMapResult['type']): string {
  const coordinates = extractCoordinates(url)
  const placeId = extractPlaceId(url)
  const placeName = extractPlaceName(url)
  const searchQuery = extractSearchQuery(url)
  const queryName = extractQueryName(url)
  const name = placeName ?? searchQuery ?? queryName

  // Short links can't be embedded
  if (type === 'short') return ''

  // Direction URLs without coordinates can't be embedded simply
  if (type === 'direction' && !coordinates) return ''

  // Best case: real Place ID — use search fallback (no API key needed)
  if (placeId) {
    return `https://maps.google.com/maps?q=place_id:${placeId}&z=15&output=embed`
  }

  // Coordinates — most reliable for embedding
  if (coordinates) {
    return `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`
  }

  // Name-based query
  if (name) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(name)}&z=15&output=embed`
  }

  return ''
}

function buildOpenUrl(url: URL, type: GoogleMapResult['type']): string {
  // Short links — open directly (browser will follow redirect)
  if (type === 'short') return url.toString()

  const coordinates = extractCoordinates(url)
  const placeName = extractPlaceName(url)
  const searchQuery = extractSearchQuery(url)
  const queryName = extractQueryName(url)
  const name = placeName ?? searchQuery ?? queryName

  // Place/search names get a search link
  if (name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
  }

  // Coordinates get a search link
  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
  }

  // Direction URLs — preserve the original
  if (type === 'direction') return url.toString()

  return url.toString()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a Google Maps URL and extract structured location data.
 *
 * Returns a `GoogleMapResult` with:
 * - `valid` — whether the URL is a recognized Google Maps URL
 * - `type` — short | place | search | coordinates | direction | unknown
 * - `name` — extracted place name or search query
 * - `lat`, `lng` — extracted coordinates
 * - `embedUrl` — iframe-compatible embed URL (empty for short links)
 * - `openUrl` — reliable link that opens in Google Maps
 */
export function parseGoogleMapsUrl(input: string): GoogleMapResult {
  const originalUrl = input.trim()

  if (!originalUrl) {
    return { valid: false, type: 'unknown', originalUrl, embedUrl: '', openUrl: '', error: 'URL is required.' }
  }

  if (!isValidHttpUrl(originalUrl)) {
    return { valid: false, type: 'unknown', originalUrl, embedUrl: '', openUrl: '', error: 'Invalid URL.' }
  }

  let url: URL
  try {
    url = new URL(originalUrl)
  } catch {
    return { valid: false, type: 'unknown', originalUrl, embedUrl: '', openUrl: '', error: 'Invalid URL.' }
  }

  if (!isGoogleMapsUrl(url)) {
    return { valid: false, type: 'unknown', originalUrl, embedUrl: '', openUrl: '', error: 'Not a Google Maps URL.' }
  }

  const type = classifyUrl(url)
  const coordinates = extractCoordinates(url)
  const placeId = extractPlaceId(url)
  const placeName = extractPlaceName(url)
  const searchQuery = extractSearchQuery(url)
  const queryName = extractQueryName(url)
  const name = placeName ?? searchQuery ?? queryName

  return {
    valid: true,
    type,
    originalUrl,
    name,
    lat: coordinates?.lat,
    lng: coordinates?.lng,
    placeId: placeId ?? undefined,
    embedUrl: buildEmbedUrl(url, type),
    openUrl: buildOpenUrl(url, type),
  }
}

/**
 * Check whether a URL points to Google Maps.
 */
export function isValidGoogleMapsUrl(url: string): boolean {
  return parseGoogleMapsUrl(url).valid
}

/**
 * Returns true for short-link domains that redirect (maps.app.goo.gl, goo.gl).
 * These cannot be embedded in iframes without server-side resolution.
 */
export function isShortGoogleMapsLink(url: string): boolean {
  return parseGoogleMapsUrl(url).type === 'short'
}

/**
 * Convert any Google Maps URL to an embeddable iframe src.
 *
 * - Short links return empty string (use isShortGoogleMapsLink to detect).
 * - All other formats are parsed and converted to a fallback embed URL.
 */
export function googleMapsEmbedUrl(url: string): string {
  return parseGoogleMapsUrl(url).embedUrl
}

/**
 * Build a Google Maps "open" link that always works in a new tab.
 * Useful as a fallback button when the embed fails to load.
 */
export function googleMapsOpenUrl(url: string): string {
  return parseGoogleMapsUrl(url).openUrl
}
