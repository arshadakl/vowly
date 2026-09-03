import { cloudinaryUploadConfirmationSchema } from '@vowly/types'
import { editorContext, assertEditable, presentEditor } from '../../../../utils/editor'
import { apiError, body } from '../../../../utils/http'
import { destroyCloudinaryAsset, verifyCloudinaryAsset } from '../../../../utils/cloudinary'
import { getEnv } from '../../../../utils/env'

export default defineEventHandler(async (event) => {
  const context = await editorContext(event)
  assertEditable(context)
  const parsed = cloudinaryUploadConfirmationSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Uploaded photo details are invalid.', 400)
  const asset = parsed.data
  const prefix = `vowly/invitations/${context.invitation.id}/couple/`
  if (!asset.publicId.startsWith(prefix))
    apiError('MEDIA_VERIFICATION_FAILED', 'The photo does not belong to this invitation.', 403)
  await verifyCloudinaryAsset(event, asset)
  const previousPublicId = context.invitation.couple_image_public_id
  const now = new Date().toISOString()
  await getEnv(event)
    .DB.prepare(
      `UPDATE invitations SET
        couple_image_asset_id = ?, couple_image_public_id = ?, couple_image_version = ?,
        couple_image_format = ?, couple_image_width = ?, couple_image_height = ?,
        show_images = 1, updated_at = ?
       WHERE id = ? AND client_id = ?`,
    )
    .bind(
      asset.assetId,
      asset.publicId,
      asset.version,
      asset.format,
      asset.width,
      asset.height,
      now,
      context.invitation.id,
      context.client.id,
    )
    .run()
  if (previousPublicId && previousPublicId !== asset.publicId)
    await destroyCloudinaryAsset(event, previousPublicId).catch(() => undefined)
  const invitation = await getEnv(event)
    .DB.prepare('SELECT * FROM invitations WHERE id = ?')
    .bind(context.invitation.id)
    .first<typeof context.invitation>()
  return presentEditor(event, { ...context, invitation: invitation!, locked: false })
})
