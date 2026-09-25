import { googleMapsResolveSchema } from '@vowly/types'
import { isShortGoogleMapsLink, isValidGoogleMapsUrl } from '@vowly/utils'
import { apiError, body } from '../../utils/http'
import { checkRateLimit, MAPS_RATE_LIMIT } from '../../utils/rate-limit'

const MAX_REDIRECTS = 5

function isGoogleMapsHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return (
    host === 'maps.app.goo.gl' ||
    host === 'goo.gl' ||
    host === 'google.com' ||
    host === 'www.google.com' ||
    host === 'maps.google.com' ||
    host.endsWith('.google.com') ||
    host.endsWith('.googleusercontent.com')
  )
}

async function resolveShortLink(url: string): Promise<string> {
  let current = url
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!isValidGoogleMapsUrl(current)) {
      apiError('RESOLVE_FAILED', 'Resolved URL is not a Google Maps URL.', 400)
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    let response: Response
    try {
      response = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
    } catch {
      apiError(
        'RESOLVE_FAILED',
        'Could not resolve the Google Maps URL. Please paste the full Google Maps link instead.',
        502,
      )
    } finally {
      clearTimeout(timeout)
    }

    const status = response.status
    const location = response.headers.get('location')
    if (status >= 300 && status < 400 && location) {
      current = new URL(location, current).toString()
      const host = new URL(current).hostname
      if (!isGoogleMapsHost(host)) {
        apiError('RESOLVE_FAILED', 'The Google Maps link redirected off Google Maps.', 400)
      }
      continue
    }
    return current
  }
  apiError('RESOLVE_FAILED', 'The Google Maps link redirected too many times.', 400)
}

export default defineEventHandler(async (event) => {
  const rl = await checkRateLimit(event, MAPS_RATE_LIMIT)
  if (!rl.allowed) apiError('RATE_LIMITED', 'Too many map requests. Please try again later.', 429)
  const parsed = googleMapsResolveSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'A valid URL is required.', 400)
  const { url } = parsed.data

  if (!isValidGoogleMapsUrl(url)) {
    apiError('INVALID_INPUT', 'Only Google Maps URLs are supported.', 400)
  }

  // If it's already a full Google Maps URL (not a short link), return it as-is
  if (!isShortGoogleMapsLink(url)) {
    return { url }
  }

  return { url: await resolveShortLink(url) }
})
