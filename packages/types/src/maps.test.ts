import { describe, expect, it } from 'vitest'
import { googleMapsResolveSchema } from './maps'

describe('googleMapsResolveSchema', () => {
  it('accepts and trims a URL', () => {
    expect(googleMapsResolveSchema.parse({ url: '  https://maps.app.goo.gl/example  ' }).url).toBe(
      'https://maps.app.goo.gl/example',
    )
  })

  it.each(['', 'not-a-url', 'javascript:alert(1)'])('rejects %s', (url) => {
    expect(googleMapsResolveSchema.safeParse({ url }).success).toBe(false)
  })
})
