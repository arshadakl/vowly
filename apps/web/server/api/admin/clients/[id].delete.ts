import { apiError, requireAdmin } from '../../../utils/http'
import { getEnv } from '../../../utils/env'
import { destroyCloudinaryAsset } from '../../../utils/cloudinary'

function presentDeleted(row: Record<string, unknown>) {
  return {
    id: row.id,
    clientCode: row.client_code,
    name: row.name,
    phone: row.phone,
    passcode: row.passcode,
    status: 'DELETED',
    weddingDate: row.wedding_date,
    weddingTz: row.wedding_tz,
    createdAt: row.created_at,
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) apiError('INVALID_INPUT', 'Client id is required.', 400)
  const db = getEnv(event).DB

  const row = await db
    .prepare(
      `SELECT c.*, i.id AS invitation_id, i.couple_image_public_id
       FROM clients c
       LEFT JOIN invitations i ON i.client_id = c.id
       WHERE c.id = ?`,
    )
    .bind(id)
    .first<Record<string, unknown>>()
  if (!row) apiError('NOT_FOUND', 'Client not found.', 404)

  await db.batch([
    db
      .prepare(
        'DELETE FROM rsvps WHERE invitation_id IN (SELECT id FROM invitations WHERE client_id = ?)',
      )
      .bind(id),
    db
      .prepare(
        'DELETE FROM events WHERE invitation_id IN (SELECT id FROM invitations WHERE client_id = ?)',
      )
      .bind(id),
    db
      .prepare(
        'DELETE FROM invitation_template_customizations WHERE invitation_id IN (SELECT id FROM invitations WHERE client_id = ?)',
      )
      .bind(id),
    db.prepare('DELETE FROM invitations WHERE client_id = ?').bind(id),
    db.prepare("DELETE FROM sessions WHERE subject_type = 'client' AND subject_id = ?").bind(id),
    db.prepare('DELETE FROM clients WHERE id = ?').bind(id),
  ])

  if (typeof row.couple_image_public_id === 'string' && row.couple_image_public_id) {
    await destroyCloudinaryAsset(event, row.couple_image_public_id).catch(() => undefined)
  }

  return presentDeleted(row)
})
