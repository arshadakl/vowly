import { Hono } from 'hono'
import { cors } from 'hono/cors'
import health from './routes/health'
import adminAuth from './routes/admin-auth'
import adminClients from './routes/admin-clients'
import { notFound, onError } from './middleware/errors'
import type { Env } from './lib/env'

const app = new Hono<{ Bindings: Env }>().basePath('/api')

app.use(
  '*',
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  }),
)
app.route('/health', health)
app.route('/auth/admin', adminAuth)
app.route('/admin/clients', adminClients)

app.notFound(notFound)
app.onError(onError)

export default app
