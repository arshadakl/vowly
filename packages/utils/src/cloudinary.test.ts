import { describe, expect, it } from 'vitest'
import { cloudinaryDeliveryUrl, signCloudinaryParams } from './cloudinary'

describe('cloudinaryDeliveryUrl', () => {
  it('builds an optimized URL from verified asset metadata', () => {
    expect(
      cloudinaryDeliveryUrl('vowly-demo', {
        publicId: 'vowly/invitations/inv 1/couple/photo',
        version: 42,
        format: 'jpg',
      }),
    ).toBe(
      'https://res.cloudinary.com/vowly-demo/image/upload/c_fill,g_auto,w_960,h_1200,f_auto,q_auto/v42/vowly/invitations/inv%201/couple/photo.jpg',
    )
  })

  it('does not construct a URL from incomplete metadata', () => {
    expect(cloudinaryDeliveryUrl(undefined, null)).toBeNull()
  })

  it('signs only the supplied allowlisted parameters in stable key order', async () => {
    const first = await signCloudinaryParams(
      { timestamp: 1_700_000_000, public_id: 'vowly/invitations/one', overwrite: false },
      'test-secret',
    )
    const reordered = await signCloudinaryParams(
      { overwrite: false, public_id: 'vowly/invitations/one', timestamp: 1_700_000_000 },
      'test-secret',
    )
    expect(first).toBe(reordered)
    expect(first).toMatch(/^[a-f0-9]{40}$/)
  })
})
