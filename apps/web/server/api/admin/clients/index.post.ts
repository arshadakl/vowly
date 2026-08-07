import { clientCreateSchema } from '@vowly/types'
import { formatClientCode, generatePasscode } from '@vowly/utils'
import { apiError, body, requireAdmin } from '../../../utils/http'
import { getEnv } from '../../../utils/env'

function present(row: Record<string, unknown>) {
  return {
    id: row.id,
    clientCode: row.client_code,
    name: row.name,
    phone: row.phone,
    passcode: row.passcode,
    status: row.status,
    weddingDate: row.wedding_date,
    weddingTz: row.wedding_tz,
    createdAt: row.created_at,
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parsed = clientCreateSchema.safeParse(await body(event))
  if (!parsed.success) apiError('INVALID_INPUT', 'Name, phone, and wedding date are required.', 400)

  const db = getEnv(event).DB
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const latest = await db
      .prepare(
        'SELECT client_code FROM clients ORDER BY CAST(SUBSTR(client_code, 4) AS INTEGER) DESC LIMIT 1',
      )
      .first<{ client_code: string }>()
    const nextNumber = (latest ? Number.parseInt(latest.client_code.slice(3), 10) : 0) + 1 + attempt
    const code = formatClientCode(nextNumber)
    let passcode = generatePasscode()
    for (let passcodeAttempt = 0; passcodeAttempt < 5; passcodeAttempt += 1) {
      if (!(await db.prepare('SELECT id FROM clients WHERE passcode = ?').bind(passcode).first()))
        break
      passcode = generatePasscode()
    }
    if (await db.prepare('SELECT id FROM clients WHERE passcode = ?').bind(passcode).first())
      continue

    const id = crypto.randomUUID()
    try {
      await db.batch([
        db
          .prepare(
            "INSERT INTO clients (id, client_code, name, phone, passcode, status, wedding_date) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?)",
          )
          .bind(id, code, parsed.data.name, parsed.data.phone, passcode, parsed.data.weddingDate),
        db
          .prepare('INSERT INTO invitations (id, client_id) VALUES (?, ?)')
          .bind(crypto.randomUUID(), id),
      ])
      const created = await db
        .prepare('SELECT * FROM clients WHERE id = ?')
        .bind(id)
        .first<Record<string, unknown>>()
      if (!created) apiError('INTERNAL', 'Client was created but could not be loaded.', 500)
      setResponseStatus(event, 201)
      return present(created)
    } catch {
      // Retry unique-code/passcode conflicts caused by concurrent admin requests.
    }
  }

  apiError('CONFLICT', 'Could not create a unique client record. Please try again.', 409)
})
