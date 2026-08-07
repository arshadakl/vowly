import { describe, expect, it } from 'vitest'
import {
  isValidGoogleMapsUrl,
  isShortGoogleMapsLink,
  googleMapsEmbedUrl,
  googleMapsOpenUrl,
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

describe('googleMapsEmbedUrl', () => {
  it('returns empty string for short links (cannot embed)', () => {
    expect(googleMapsEmbedUrl('https://maps.app.goo.gl/8PjKQJnB4VnatcvdA')).toBe('')
  })

  it('returns empty string for goo.gl/maps short links', () => {
    expect(googleMapsEmbedUrl('https://goo.gl/maps/abc123')).toBe('')
  })

  it('passes already-embeddable URLs through', () => {
    const url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100'
    expect(googleMapsEmbedUrl(url)).toBe(url)
  })

  it('converts place URLs using place name', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/place/Taj+Mahal/@27.1751,78.0421,15z',
    )
    expect(result).toContain('output=embed')
    expect(result).toContain('q=Taj%20Mahal')
  })

  it('converts search URLs using search query', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/search/wedding+venues+near+me/@28.6,77.2,12z',
    )
    expect(result).toContain('output=embed')
    expect(result).toContain('q=wedding%20venues%20near%20me')
  })

  it('converts direction URLs', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/dir/Hotel+Taj/Grand+Palace',
    )
    expect(result).toContain('output=embed')
    expect(result).toContain('q=Hotel%20Taj%20to%20Grand%20Palace')
  })

  it('converts coordinate URLs', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/@28.6139,77.209,15z',
    )
    expect(result).toContain('output=embed')
    expect(result).toContain('q=28.6139%2C77.209')
  })

  it('converts legacy maps.google.com URLs with q param', () => {
    const result = googleMapsEmbedUrl(
      'https://maps.google.com/?q=Taj+Mahal&ll=27.1751,78.0421&z=15',
    )
    expect(result).toContain('output=embed')
    expect(result).toContain('q=Taj%20Mahal')
  })

  it('handles URLs with www prefix', () => {
    const result = googleMapsEmbedUrl(
      'https://www.google.com/maps/place/Grand+Palace/@26.9,75.7,15z',
    )
    expect(result).toContain('output=embed')
    expect(result).toContain('q=Grand%20Palace')
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
    expect(result).toContain('query=Taj%20Mahal')
  })

  it('converts coordinate URLs to search links', () => {
    const result = googleMapsOpenUrl(
      'https://www.google.com/maps/@28.6,77.2,12z',
    )
    expect(result).toContain('google.com/maps/search/')
    expect(result).toContain('query=28.6%2C77.2')
  })
})
