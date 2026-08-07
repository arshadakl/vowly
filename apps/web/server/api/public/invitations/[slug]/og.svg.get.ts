import { apiError } from '../../../../utils/http'
import { getEnv } from '../../../../utils/env'
export default defineEventHandler(async (event) => {
  const row = await getEnv(event)
    .DB.prepare(
      "SELECT i.bride_name, i.groom_name, i.template FROM invitations i JOIN clients c ON c.id = i.client_id WHERE i.slug = ? AND i.published = 1 AND c.status = 'ACTIVE'",
    )
    .bind(getRouterParam(event, 'slug'))
    .first<{ bride_name: string; groom_name: string; template: string }>()
  if (!row) apiError('NOT_FOUND', 'Invitation not found.', 404)
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!,
    )
  const dark = row.template === 'luxury'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="${dark ? '#14100c' : '#faf7f2'}"/><text x="600" y="250" text-anchor="middle" fill="${dark ? '#f5ead6' : '#2b2620'}" font-family="Georgia,serif" font-size="64">${escape(row.bride_name)} &amp; ${escape(row.groom_name)}</text><text x="600" y="340" text-anchor="middle" fill="${dark ? '#d4af37' : '#b08d57'}" font-family="Arial,sans-serif" font-size="22" letter-spacing="8">WEDDING INVITATION</text><text x="600" y="520" text-anchor="middle" fill="${dark ? '#f5ead6' : '#2b2620'}" font-family="Arial,sans-serif" font-size="18">VOWLY</text></svg>`
  setResponseHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return svg
})
