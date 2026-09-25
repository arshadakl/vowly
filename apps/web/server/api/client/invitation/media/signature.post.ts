import { editorContext, assertEditable } from '../../../../utils/editor'
import { cloudinaryConfig, signCloudinaryParams } from '../../../../utils/cloudinary'
import { checkRateLimit, MEDIA_RATE_LIMIT } from '../../../../utils/rate-limit'
import { apiError } from '../../../../utils/http'

export default defineEventHandler(async (event) => {
  const context = await editorContext(event)
  assertEditable(context)
  const rl = await checkRateLimit(event, MEDIA_RATE_LIMIT)
  if (!rl.allowed) apiError('RATE_LIMITED', 'Too many photo requests. Please try again later.', 429)
  const config = cloudinaryConfig(event)
  const timestamp = Math.floor(Date.now() / 1000)
  const publicId = `vowly/invitations/${context.invitation.id}/couple/${crypto.randomUUID()}`
  const params: Record<string, string | number | boolean> = {
    overwrite: false,
    public_id: publicId,
    timestamp,
  }
  params.upload_preset = config.uploadPreset
  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    uploadPreset: config.uploadPreset,
    publicId,
    timestamp,
    overwrite: false,
    signature: await signCloudinaryParams(params, config.apiSecret),
  }
})
