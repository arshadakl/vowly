import { googleMapsResolveSchema } from '@vowly/types'
import { isShortGoogleMapsLink, isValidGoogleMapsUrl } from '@vowly/utils'
import { apiError, body } from '../../utils/http'

export default defineEventHandler(async (event) => {
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

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  let response: Response
  try {
    response = await fetch(url, {
      redirect: 'follow',
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

  const resolvedUrl = response.url
  if (!isValidGoogleMapsUrl(resolvedUrl)) {
    apiError('INVALID_INPUT', 'Resolved URL is not a Google Maps URL.', 400)
  }

  return { url: resolvedUrl }
})
