import { getEnv } from '../utils/env'
import { envName } from '../utils/http'

export default defineEventHandler(async (event) => {
  const response = {
    service: 'vowly',
    environment: envName(event),
    time: new Date().toISOString(),
  }

  try {
    const database = await getEnv(event).DB.prepare('SELECT 1 AS healthy').first<{
      healthy: number
    }>()
    if (database?.healthy !== 1) throw new Error('D1 health check failed')
  } catch {
    setResponseStatus(event, 503)
    return { status: 'error', database: 'unavailable', ...response }
  }

  return { status: 'ok', database: 'ok', ...response }
})
