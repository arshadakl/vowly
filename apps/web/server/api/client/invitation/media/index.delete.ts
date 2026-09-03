import { editorContext, assertEditable, presentEditor } from '../../../../utils/editor'
import { destroyCloudinaryAsset } from '../../../../utils/cloudinary'
import { getEnv } from '../../../../utils/env'

export default defineEventHandler(async (event) => {
  const context = await editorContext(event)
  assertEditable(context)
  const previousPublicId = context.invitation.couple_image_public_id
  const now = new Date().toISOString()
  await getEnv(event)
    .DB.prepare(
      `UPDATE invitations SET
        couple_image_asset_id = NULL, couple_image_public_id = NULL,
        couple_image_version = NULL, couple_image_format = NULL,
        couple_image_width = NULL, couple_image_height = NULL,
        show_images = 0, updated_at = ?
       WHERE id = ? AND client_id = ?`,
    )
    .bind(now, context.invitation.id, context.client.id)
    .run()
  if (previousPublicId) await destroyCloudinaryAsset(event, previousPublicId).catch(() => undefined)
  const invitation = await getEnv(event)
    .DB.prepare('SELECT * FROM invitations WHERE id = ?')
    .bind(context.invitation.id)
    .first<typeof context.invitation>()
  return presentEditor(event, { ...context, invitation: invitation!, locked: false })
})
