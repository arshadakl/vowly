import { Hono } from 'hono'
import type { Env } from '../lib/env'

const app = new Hono<{ Bindings: Env }>()

app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'vowly-api',
    environment: c.env.ENVIRONMENT,
    time: new Date().toISOString(),
  })
})

export default app
