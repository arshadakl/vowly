import type { H3Event } from 'h3'
import { signCloudinaryParams } from '@vowly/utils'
import { getEnv } from './env'
import { apiError } from './http'

export { cloudinaryDeliveryUrl, signCloudinaryParams } from '@vowly/utils'

interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  apiSecret: string
  uploadPreset: string
}

export interface CloudinaryAsset {
  assetId: string
  publicId: string
  version: number
  format: string
  width: number
  height: number
  bytes: number
}

export function cloudinaryConfig(event: H3Event): CloudinaryConfig {
  const env = getEnv(event)
  if (
    !env.CLOUDINARY_CLOUD_NAME ||
    !env.CLOUDINARY_API_KEY ||
    !env.CLOUDINARY_API_SECRET ||
    !env.CLOUDINARY_UPLOAD_PRESET
  )
    apiError('MEDIA_UNAVAILABLE', 'Photo uploads are not configured.', 503)
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    apiKey: env.CLOUDINARY_API_KEY!,
    apiSecret: env.CLOUDINARY_API_SECRET!,
    uploadPreset: env.CLOUDINARY_UPLOAD_PRESET!,
  }
}

export async function verifyCloudinaryAsset(
  event: H3Event,
  expected: CloudinaryAsset,
): Promise<CloudinaryAsset> {
  const config = cloudinaryConfig(event)
  const encodedPublicId = encodeURIComponent(expected.publicId)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/resources/image/upload/${encodedPublicId}`,
    {
      headers: {
        Authorization: `Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`,
      },
    },
  )
  if (!response.ok)
    apiError('MEDIA_VERIFICATION_FAILED', 'Could not verify the uploaded photo.', 400)
  const remote = (await response.json()) as {
    asset_id?: string
    public_id?: string
    version?: number
    format?: string
    width?: number
    height?: number
    bytes?: number
    resource_type?: string
  }
  if (
    remote.resource_type !== 'image' ||
    remote.asset_id !== expected.assetId ||
    remote.public_id !== expected.publicId ||
    remote.version !== expected.version ||
    remote.format !== expected.format ||
    remote.width !== expected.width ||
    remote.height !== expected.height ||
    remote.bytes !== expected.bytes
  )
    apiError('MEDIA_VERIFICATION_FAILED', 'The uploaded photo details did not match.', 400)
  return expected
}

export async function destroyCloudinaryAsset(event: H3Event, publicId: string): Promise<void> {
  const config = cloudinaryConfig(event)
  const timestamp = Math.floor(Date.now() / 1000)
  const params = { invalidate: true, public_id: publicId, timestamp }
  const signature = await signCloudinaryParams(params, config.apiSecret)
  const form = new FormData()
  form.set('public_id', publicId)
  form.set('timestamp', String(timestamp))
  form.set('invalidate', 'true')
  form.set('api_key', config.apiKey)
  form.set('signature', signature)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/destroy`,
    { method: 'POST', body: form },
  )
  if (!response.ok) throw new Error('Cloudinary destroy request failed')
}
