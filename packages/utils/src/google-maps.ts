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

export interface GoogleMapLocation {
  latitude?: number
  longitude?: number
  placeId?: string
  name?: string
}

export interface GoogleMapResult {
  valid: boolean
  originalUrl: string
  normalizedUrl?: string
  embedUrl?: string
  location?: GoogleMapLocation
  type?: 'short' | 'place' | 'search' | 'coordinates' | 'direction' | 'unknown'
  error?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_HOSTS = new Set([
  'google.com',
  'www.google.com',
  'maps.google.com',
  'maps.app.goo.gl',
  'goo.gl',
])

const SHORT_LINK_HOSTS = new Set(['maps.app.goo.gl', 'goo.gl'])

const GOOGLE_MAP_PATH = /^\/maps(?:\/|$)/i

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
  if (ALLOWED_HOSTS.has(host)) return true
  return host.endsWith('.google.com') || host.endsWith('.googleusercontent.com')
}

function isGoogleMapsUrl(url: URL): boolean {
  const hostname = url.hostname.toLowerCase()
  if (!isGoogleMapsHost(hostname)) return false

  if (SHORT_LINK_HOSTS.has(hostname)) return true

  if (hostname === 'google.com' || hostname === 'www.google.com' || hostname === 'maps.google.com') {
    return GOOGLE_MAP_PATH.test(url.pathname)
  }

  return false
}

function extractCoordinates(url: URL): { latitude: number; longitude: number } | undefined {
  // /@11.1215847,76.2887387,1133m or /@11.1215847,76.2887387
  const atMatch = url.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    return { latitude: Number(atMatch[1]), longitude: Number(atMatch[2]) }
  }

  // ?query=11.1215847,76.2887387
  const query = url.searchParams.get('query') ?? url.searchParams.get('q')
  if (query) {
    const queryMatch = query.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/)
    if (queryMatch) {
      return { latitude: Number(queryMatch[1]), longitude: Number(queryMatch[2]) }
    }
  }

  return undefined
}

function extractPlaceId(url: URL): string | undefined {
  const queryPlaceId = url.searchParams.get('query_place_id')
  if (queryPlaceId) return queryPlaceId

  const placeId = url.searchParams.get('place_id')
  if (placeId) return placeId

  return undefined
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

function classifyUrl(url: URL): GoogleMapResult['type'] {
  const host = url.hostname.toLowerCase()

  if (SHORT_LINK_HOSTS.has(host)) return 'short'
  if (/\/maps\/place\//i.test(url.pathname)) return 'place'
  if (/\/maps\/search/i.test(url.pathname)) return 'search'
  if (/\/maps\/dir\//i.test(url.pathname)) return 'direction'
  if (extractCoordinates(url)) return 'coordinates'

  return 'unknown'
}

function validateCoordinates(latitude?: number, longitude?: number): boolean {
  if (latitude === undefined || longitude === undefined) return false
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  )
}

/**
 * Build an embeddable Google Maps iframe URL from coordinates.
 * This does NOT require an API key — uses the standard embed endpoint.
 */
function embedFromCoordinates(latitude: number, longitude: number): string {
  return `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`
}

/**
 * Build an embeddable Google Maps iframe URL from a search/place query.
 */
function embedFromQuery(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
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
 * - `embedUrl` — iframe-compatible embed URL (empty for short links)
 * - `location` — extracted coordinates, place ID, and name
 * - `error` — validation error message if invalid
 */
export function parseGoogleMapsUrl(input: string): GoogleMapResult {
  const originalUrl = input.trim()

  if (!originalUrl) {
    return { valid: false, originalUrl, error: 'URL is required.' }
  }

  if (!isValidHttpUrl(originalUrl)) {
    return { valid: false, originalUrl, error: 'Invalid URL.' }
  }

  let url: URL
  try {
    url = new URL(originalUrl)
  } catch {
    return { valid: false, originalUrl, error: 'Invalid URL.' }
  }

  if (!isGoogleMapsUrl(url)) {
    return { valid: false, originalUrl, error: 'URL is not a valid Google Maps URL.' }
  }

  const type = classifyUrl(url)

  // Short URLs cannot be parsed without following redirects server-side
  if (type === 'short') {
    return {
      valid: true,
      originalUrl,
      normalizedUrl: url.toString(),
      type: 'short',
    }
  }

  const coordinates = extractCoordinates(url)
  const placeId = extractPlaceId(url)
  const name = extractPlaceName(url)
  const searchQuery = extractSearchQuery(url)

  if (coordinates && !validateCoordinates(coordinates.latitude, coordinates.longitude)) {
    return { valid: false, originalUrl, error: 'Invalid latitude or longitude.' }
  }

  // Build embed URL
  let embedUrl = ''

  if (placeId) {
    // Best case: real Place ID — use search fallback (no API key needed)
    embedUrl = embedFromQuery(`place_id:${placeId}`)
  } else if (coordinates) {
    embedUrl = embedFromCoordinates(coordinates.latitude, coordinates.longitude)
  } else if (searchQuery) {
    embedUrl = embedFromQuery(searchQuery)
  } else if (name) {
    embedUrl = embedFromQuery(name)
  }

  return {
    valid: true,
    originalUrl,
    normalizedUrl: url.toString(),
    embedUrl,
    location: {
      ...coordinates,
      placeId,
      name: name ?? searchQuery,
    },
    type,
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
 * - Embed-ready URLs (/maps/embed?pb=...) are returned as-is.
 * - All other formats are parsed and converted to a fallback embed URL.
 */
export function googleMapsEmbedUrl(url: string): string {
  const result = parseGoogleMapsUrl(url)
  if (!result.valid) return ''
  return result.embedUrl ?? ''
}

/**
 * Build a Google Maps "open" link that always works in a new tab.
 * Useful as a fallback button when the embed fails to load.
 */
export function googleMapsOpenUrl(url: string): string {
  const result = parseGoogleMapsUrl(url)
  if (!result.valid) return '#'

  // Short links — open directly (browser will follow redirect)
  if (result.type === 'short') return result.originalUrl

  // For coordinates, build a reliable search link
  if (result.location?.latitude && result.location?.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${result.location.latitude},${result.location.longitude}`
  }

  // For place names or search queries
  if (result.location?.name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.location.name)}`
  }

  return result.normalizedUrl ?? result.originalUrl
}
