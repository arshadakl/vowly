import { apiError, body } from '../../utils/http'

export default defineEventHandler(async (event) => {
  const parsed = await body(event)
  const url = parsed?.url

  if (typeof url !== 'string' || !url || url.length > 2000) {
    apiError('INVALID_INPUT', 'A valid URL is required.', 400)
  }

  const hostname = new URL(url!).hostname.toLowerCase()
  const isShortLink = hostname === 'maps.app.goo.gl' || hostname === 'goo.gl'
  const isGoogleMaps = hostname.includes('google.com') || hostname.includes('googleusercontent.com')

  if (!isShortLink && !isGoogleMaps) {
    apiError('INVALID_INPUT', 'Only Google Maps URLs are supported.', 400)
  }

  // If it's already a full Google Maps URL (not a short link), return it as-is
  if (!isShortLink) {
    return { url: url! }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url!, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    clearTimeout(timeout)

    const resolvedUrl = response.url
    const resolvedHostname = new URL(resolvedUrl).hostname.toLowerCase()
    const isResolvedGoogleMaps = resolvedHostname.includes('google.com') || resolvedHostname.includes('googleusercontent.com')

    if (!isResolvedGoogleMaps) {
      apiError('INVALID_INPUT', 'Resolved URL is not a Google Maps URL.', 400)
    }

    return { url: resolvedUrl }
  } catch {
    apiError('RESOLVE_FAILED', 'Could not resolve the Google Maps URL. Please try pasting the full Google Maps link instead.', 500)
  }
})
