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

  try {
    const response = await fetch(url!, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VowlyBot/1.0)',
      },
    })

    const resolvedUrl = response.url
    const resolvedHostname = new URL(resolvedUrl).hostname.toLowerCase()
    const isResolvedGoogleMaps = resolvedHostname.includes('google.com') || resolvedHostname.includes('googleusercontent.com')

    if (!isResolvedGoogleMaps) {
      apiError('INVALID_INPUT', 'Resolved URL is not a Google Maps URL.', 400)
    }

    return { url: resolvedUrl }
  } catch {
    apiError('RESOLVE_FAILED', 'Could not resolve the Google Maps URL.', 500)
  }
})
