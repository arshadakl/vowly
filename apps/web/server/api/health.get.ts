import { envName } from '../utils/http'

export default defineEventHandler((event) => ({ status: 'ok', service: 'vowly', environment: envName(event), time: new Date().toISOString() }))
