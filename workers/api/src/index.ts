import { Hono } from 'hono'
import health from './routes/health'
import { notFound, onError } from './middleware/errors'
import type { Env } from './lib/env'

const app = new Hono<{ Bindings: Env }>().basePath('/api')

app.route('/health', health)

app.notFound(notFound)
app.onError(onError)

export default app
