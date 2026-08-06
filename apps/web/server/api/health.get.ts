import { envName } from '../utils/http'

export default defineEventHandler((event) => ({ status: 'ok', service: 'vowly-api', environment: envName(event), time: new Date().toISOString() }))
