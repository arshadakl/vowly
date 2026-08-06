import { Hono } from 'hono'
import { cors } from 'hono/cors'
import health from './routes/health'
import adminAuth from './routes/admin-auth'
import adminClients from './routes/admin-clients'
import clientAuth from './routes/client-auth'
import clientEditor from './routes/client-editor'
import publishing from './routes/publishing'
import publicInvitations from './routes/public-invitations'
import rsvps from './routes/rsvps'
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
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
})
app.route('/health', health)
app.route('/auth/admin', adminAuth)
app.route('/auth/client', clientAuth)
app.route('/admin/clients', adminClients)
app.route('/client', clientEditor)
app.route('/client', publishing)
app.route('/public', publicInvitations)
app.route('/public', rsvps)
app.route('/client', rsvps)
app.route('/admin', publishing)
app.route('/admin', rsvps)

app.notFound(notFound)
app.onError(onError)

export default app
