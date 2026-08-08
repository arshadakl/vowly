import { describe, expect, it } from 'vitest'
import {
  isValidGoogleMapsUrl,
  isShortGoogleMapsLink,
  googleMapsEmbedUrl,
  googleMapsOpenUrl,
  parseGoogleMapsUrl,
} from './google-maps'

describe('isValidGoogleMapsUrl', () => {
  it('accepts standard google.com/maps/place URLs', () => {
    expect(
      isValidGoogleMapsUrl(
        'https://www.google.com/maps/place/Taj+Mahal/@27.1751,78.0421,15z/data=!',
      ),
    ).toBe(true)
  })

  it('accepts maps.app.goo.gl short links', () => {
    expect(isValidGoogleMapsUrl('https://maps.app.goo.gl/8PjKQJnB4VnatcvdA')).toBe(true)
  })

  it('accepts goo.gl/maps short links', () => {
    expect(isValidGoogleMapsUrl('https://goo.gl/maps/abc123')).toBe(true)
  })

  it('accepts maps.google.com URLs', () => {
    expect(isValidGoogleMapsUrl('https://maps.google.com/?q=Taj+Mahal')).toBe(true)
  })

  it('accepts google.com/travel URLs', () => {
    expect(isValidGoogleMapsUrl('https://www.google.com/travel/hotels/Paris')).toBe(true)
  })

  it('accepts bare google.com/maps URLs', () => {
    expect(isValidGoogleMapsUrl('https://google.com/maps/@28.6139,77.209,15z')).toBe(true)
  })

  it('rejects non-Google URLs', () => {
    expect(isValidGoogleMapsUrl('https://openstreetmap.org/')).toBe(false)
  })

  it('rejects empty strings', () => {
    expect(isValidGoogleMapsUrl('')).toBe(false)
  })

  it('rejects invalid URLs', () => {
    expect(isValidGoogleMapsUrl('not-a-url')).toBe(false)
  })
})

describe('isShortGoogleMapsLink', () => {
  it('identifies maps.app.goo.gl links', () => {
    expect(isShortGoogleMapsLink('https://maps.app.goo.gl/8PjKQJnB4VnatcvdA')).toBe(true)
  })

  it('identifies goo.gl/maps links', () => {
    expect(isShortGoogleMapsLink('https://goo.gl/maps/abc123')).toBe(true)
  })

  it('identifies bare goo.gl links', () => {
    expect(isShortGoogleMapsLink('https://goo.gl/abc123')).toBe(true)
  })

  it('returns false for full google.com URLs', () => {
    expect(isShortGoogleMapsLink('https://www.google.com/maps/place/Taj+Mahal')).toBe(false)
  })

  it('returns false for maps.google.com URLs', () => {
    expect(isShortGoogleMapsLink('https://maps.google.com/?q=Taj+Mahal')).toBe(false)
  })

  it('returns false for invalid URLs', () => {
    expect(isShortGoogleMapsLink('not-a-url')).toBe(false)
  })
})

describe('parseGoogleMapsUrl', () => {
  it('parses place URLs with coordinates and name', () => {
    const result = parseGoogleMapsUrl(
      'https://www.google.com/maps/place/Taj+Mahal/@27.1751,78.0421,15z',
    )
    expect(result.valid).toBe(true)
    expect(result.type).toBe('place')
    expect(result.name).toBe('Taj Mahal')
    expect(result.lat).toBe(27.1751)
    expect(result.lng).toBe(78.0421)
    expect(result.embedUrl).toContain('google.com/maps/embed')
    expect(result.embedUrl).toContain('!2d78.0421')
    expect(result.embedUrl).toContain('!3d27.1751')
    expect(result.openUrl).toContain('google.com/maps/search/')
    expect(result.openUrl).toContain('query=Taj')
  })

  it('parses place URLs with place ID in data param', () => {
    const result = parseGoogleMapsUrl(
      'https://www.google.com/maps/place/Taj+Mahal/@27.1751,78.0421,15z/data=!3m1!4b1!4m6!3m5!1s0x3987b99fa4c2a75d:0x6da8286e2dba3d0b!8m2!3d27.1751!4d78.0421',
    )
    expect(result.valid).toBe(true)
    expect(result.type).toBe('place')
    expect(result.placeId).toBe('0x3987b99fa4c2a75d:0x6da8286e2dba3d0b')
    expect(result.embedUrl).toContain('google.com/maps/embed')
    expect(result.embedUrl).toContain('!1s0x3987b99fa4c2a75d:0x6da8286e2dba3d0b')
  })

  it('parses search URLs with query and coordinates', () => {
    const result = parseGoogleMapsUrl(
      'https://www.google.com/maps/search/wedding+venues+near+me/@28.6,77.2,12z',
    )
    expect(result.valid).toBe(true)
    expect(result.type).toBe('search')
    expect(result.name).toBe('wedding venues near me')
    expect(result.lat).toBe(28.6)
    expect(result.lng).toBe(77.2)
    expect(result.embedUrl).toContain('google.com/maps/embed')
    expect(result.embedUrl).toContain('!2d77.2')
    expect(result.embedUrl).toContain('!3d28.6')
    expect(result.openUrl).toContain('query=wedding')
  })

  it('parses direction URLs', () => {
    const result = parseGoogleMapsUrl(
      'https://www.google.com/maps/dir/Hotel+Taj/Grand+Palace',
    )
    expect(result.valid).toBe(true)
    expect(result.type).toBe('direction')
    expect(result.openUrl).toContain('google.com/maps/dir/')
  })

  it('parses coordinate URLs', () => {
    const result = parseGoogleMapsUrl(
      'https://www.google.com/maps/@28.6139,77.209,15z',
    )
    expect(result.valid).toBe(true)
    expect(result.type).toBe('coordinates')
    expect(result.lat).toBe(28.6139)
    expect(result.lng).toBe(77.209)
    expect(result.embedUrl).toContain('google.com/maps/embed')
    expect(result.embedUrl).toContain('!2d77.209')
    expect(result.embedUrl).toContain('!3d28.6139')
    expect(result.openUrl).toContain('query=28.6139,77.209')
  })

  it('parses legacy maps.google.com URLs with q param', () => {
    const result = parseGoogleMapsUrl(
      'https://maps.google.com/?q=Taj+Mahal&ll=27.1751,78.0421&z=15',
    )
    expect(result.valid).toBe(true)
    expect(result.type).toBe('coordinates')
    expect(result.lat).toBe(27.1751)
    expect(result.lng).toBe(78.0421)
    expect(result.embedUrl).toContain('google.com/maps/embed')
    expect(result.embedUrl).toContain('!2d78.0421')
    expect(result.embedUrl).toContain('!3d27.1751')
    expect(result.openUrl).toContain('query=Taj')
  })

  it('identifies short links', () => {
    const result = parseGoogleMapsUrl('https://maps.app.goo.gl/8PjKQJnB4VnatcvdA')
    expect(result.valid).toBe(true)
    expect(result.type).toBe('short')
    expect(result.embedUrl).toBe('')
    expect(result.openUrl).toBe('https://maps.app.goo.gl/8PjKQJnB4VnatcvdA')
  })

  it('returns invalid for non-Google URLs', () => {
    const result = parseGoogleMapsUrl('https://openstreetmap.org/')
    expect(result.valid).toBe(false)
  })

  it('returns invalid for empty strings', () => {
    const result = parseGoogleMapsUrl('')
    expect(result.valid).toBe(false)
  })
})

describe('googleMapsEmbedUrl', () => {
  it('returns empty string for short links (cannot embed)', () => {
    expect(googleMapsEmbedUrl('https://maps.app.goo.gl/8PjKQJnB4VnatcvdA')).toBe('')
  })

  it('returns empty string for goo.gl/maps short links', () => {
    expect(googleMapsEmbedUrl('https://goo.gl/maps/abc123')).toBe('')
  })

  it('generates pb embed URL for place URLs with coordinates', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/place/Taj+Mahal/@27.1751,78.0421,15z',
    )
    expect(result).toContain('google.com/maps/embed')
    expect(result).toContain('!2d78.0421')
    expect(result).toContain('!3d27.1751')
  })

  it('generates pb embed URL for coordinate URLs', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/@28.6139,77.209,15z',
    )
    expect(result).toContain('google.com/maps/embed')
    expect(result).toContain('!2d77.209')
    expect(result).toContain('!3d28.6139')
  })

  it('returns empty string for direction URLs (no coordinates)', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/dir/Hotel+Taj/Grand+Palace',
    )
    expect(result).toBe('')
  })

  it('includes place ID when available in URL', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/place/Taj+Mahal/@27.1751,78.0421,15z/data=!3m1!4b1!4m6!3m5!1s0x3987b99fa4c2a75d:0x6da8286e2dba3d0b!8m2!3d27.1751!4d78.0421',
    )
    expect(result).toContain('google.com/maps/embed')
    expect(result).toContain('!1s0x3987b99fa4c2a75d:0x6da8286e2dba3d0b')
  })
})

describe('googleMapsOpenUrl', () => {
  it('returns short links as-is', () => {
    const url = 'https://maps.app.goo.gl/8PjKQJnB4VnatcvdA'
    expect(googleMapsOpenUrl(url)).toBe(url)
  })

  it('builds a search API link from place URLs', () => {
    const result = googleMapsOpenUrl(
      'https://www.google.com/maps/place/Taj+Mahal/@27.1751,78.0421,15z',
    )
    expect(result).toContain('google.com/maps/search/')
    expect(result).toContain('api=1')
    expect(result).toContain('query=Taj')
  })

  it('converts coordinate URLs to search links', () => {
    const result = googleMapsOpenUrl(
      'https://www.google.com/maps/@28.6,77.2,12z',
    )
    expect(result).toContain('google.com/maps/search/')
    expect(result).toContain('query=28.6,77.2')
  })
})
