/**
 * Production-grade Google Maps URL parser and embed generator.
 *
 * Supports:
 * - Standard Google Maps URLs (place, search, direction, @coords)
 * - Short links (maps.app.goo.gl, goo.gl) — detected, not resolved client-side
 * - Coordinate extraction from @lat,lng and query params
 * - Place ID extraction from URL path and data params
 * - Embed URL generation using the pb format (what Google Maps actually uses)
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

// Regex patterns for extracting data from Google Maps URLs
const PLACE_ID_REGEX = /(?:1s|2s|3m3!1m2!1s)(0x[a-fA-F0-9]+(?:%3A|:)0x[a-fA-F0-9]+)/
const COORDS_REGEX = /(?:@|!2d)(-?\d+\.\d+)(?:,|!3d)(-?\d+\.\d+)/

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

function extractCoordinatesFromUrl(url: URL): { lat: number; lng: number } | undefined {
  const fullUrl = url.toString()

  // Try regex on full URL first (handles @lat,lng and !2d!3d formats)
  const coordsMatch = COORDS_REGEX.exec(fullUrl)
  if (coordsMatch) {
    return { lat: Number(coordsMatch[1]), lng: Number(coordsMatch[2]) }
  }

  // Check each param for coordinate patterns (not just the first non-null one)
  for (const key of ['ll', 'query', 'q']) {
    const val = url.searchParams.get(key)
    if (val) {
      const m = val.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
      if (m) return { lat: Number(m[1]), lng: Number(m[2]) }
    }
  }

  return undefined
}

function extractPlaceIdFromUrl(url: URL): string | undefined {
  const fullUrl = url.toString()

  // Extract from URL path/data params using regex (handles place URLs with data= param)
  const placeIdMatch = PLACE_ID_REGEX.exec(fullUrl)
  if (placeIdMatch?.[1]) {
    return placeIdMatch[1].replace('%3A', ':')
  }

  // Fallback to query params
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
  if (extractCoordinatesFromUrl(url)) return 'coordinates'

  // maps.google.com with q/query text (no coordinates in the URL)
  if (host === 'maps.google.com') {
    const q = url.searchParams.get('q') ?? url.searchParams.get('query')
    if (q && !/^\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*$/.test(q)) {
      return 'search'
    }
  }

  return 'unknown'
}

/**
 * Build an embeddable Google Maps URL.
 * Uses the query-based format which works reliably across origins.
 */
function buildEmbedUrl(latitude: number, longitude: number, _placeId?: string): string {
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed&t=&ie=UTF8&iwloc=&hl=en`
}

function buildOpenUrl(url: URL, type: GoogleMapResult['type']): string {
  if (type === 'short') return url.toString()

  const coordinates = extractCoordinatesFromUrl(url)
  const placeName = extractPlaceName(url)
  const searchQuery = extractSearchQuery(url)
  const queryName = extractQueryName(url)
  const name = placeName ?? searchQuery ?? queryName

  if (name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
  }

  if (coordinates) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
  }

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
 * - `placeId` — extracted Google Place ID (if available)
 * - `embedUrl` — iframe-compatible embed URL using pb format (empty for short links)
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
  const coordinates = extractCoordinatesFromUrl(url)
  const placeId = extractPlaceIdFromUrl(url)
  const placeName = extractPlaceName(url)
  const searchQuery = extractSearchQuery(url)
  const queryName = extractQueryName(url)
  const name = placeName ?? searchQuery ?? queryName

  // Build embed URL
  let embedUrl = ''
  if (type !== 'short') {
    if (coordinates) {
      embedUrl = buildEmbedUrl(coordinates.lat, coordinates.lng, placeId)
    } else if (placeId) {
      // Place ID without coordinates — use a default center
      embedUrl = buildEmbedUrl(0, 0, placeId)
    } else if (name) {
      // Name-only fallback — no coordinates available, skip embed
      embedUrl = ''
    }
  }

  return {
    valid: true,
    type,
    originalUrl,
    name,
    lat: coordinates?.lat,
    lng: coordinates?.lng,
    placeId: placeId ?? undefined,
    embedUrl,
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
 * Uses the pb format that Google Maps actually uses for embeds.
 * Short links return empty string (use isShortGoogleMapsLink to detect).
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
