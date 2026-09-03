import {
  DEFAULT_TEMPLATE_CUSTOMIZATION,
  templateCustomizationSchema,
  templateIdSchema,
  type TemplateCustomization,
  type TemplateId,
} from '@vowly/types'
import type { D1Database } from '@cloudflare/workers-types'

interface CustomizationRow {
  template_id: string
  version: number
  font_family: string
  font_size: number
  show_events: boolean
  music_enabled: boolean
  text_json: string
  styles_json: string
}

function jsonObject(value: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function present(row: CustomizationRow): TemplateCustomization {
  const parsed = templateCustomizationSchema.safeParse({
    version: row.version,
    fontFamily: row.font_family,
    fontSize: row.font_size,
    showEvents: Boolean(row.show_events),
    musicEnabled: Boolean(row.music_enabled),
    text: jsonObject(row.text_json),
    styles: jsonObject(row.styles_json),
  })
  return parsed.success ? parsed.data : { ...DEFAULT_TEMPLATE_CUSTOMIZATION }
}

export async function readCustomizations(
  db: D1Database,
  invitationId: string,
): Promise<Partial<Record<TemplateId, TemplateCustomization>>> {
  const rows = await db
    .prepare('SELECT * FROM invitation_template_customizations WHERE invitation_id = ?')
    .bind(invitationId)
    .all<CustomizationRow>()
  const result: Partial<Record<TemplateId, TemplateCustomization>> = {}
  for (const row of rows.results) {
    const id = templateIdSchema.safeParse(row.template_id)
    if (id.success) result[id.data] = present(row)
  }
  return result
}

export async function readCustomization(
  db: D1Database,
  invitationId: string,
  templateId: TemplateId,
): Promise<TemplateCustomization> {
  const row = await db
    .prepare(
      'SELECT * FROM invitation_template_customizations WHERE invitation_id = ? AND template_id = ?',
    )
    .bind(invitationId, templateId)
    .first<CustomizationRow>()
  return row ? present(row) : { ...DEFAULT_TEMPLATE_CUSTOMIZATION }
}

export async function writeCustomization(
  db: D1Database,
  invitationId: string,
  templateId: TemplateId,
  customization: TemplateCustomization,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO invitation_template_customizations
        (invitation_id, template_id, version, font_family, font_size, show_events, music_enabled, text_json, styles_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(invitation_id, template_id) DO UPDATE SET
        version = excluded.version,
        font_family = excluded.font_family,
        font_size = excluded.font_size,
        show_events = excluded.show_events,
        music_enabled = excluded.music_enabled,
        text_json = excluded.text_json,
        styles_json = excluded.styles_json,
        updated_at = excluded.updated_at`,
    )
    .bind(
      invitationId,
      templateId,
      customization.version,
      customization.fontFamily,
      customization.fontSize,
      customization.showEvents ? 1 : 0,
      customization.musicEnabled ? 1 : 0,
      JSON.stringify(customization.text),
      JSON.stringify(customization.styles),
      new Date().toISOString(),
    )
    .run()
}
