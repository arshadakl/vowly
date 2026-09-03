import { editorContext, assertEditable } from '../../../../utils/editor'
import { cloudinaryConfig, signCloudinaryParams } from '../../../../utils/cloudinary'

export default defineEventHandler(async (event) => {
  const context = await editorContext(event)
  assertEditable(context)
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
