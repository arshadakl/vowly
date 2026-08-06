import { HTTPException } from 'hono/http-exception'
import type { ErrorHandler, NotFoundHandler } from 'hono'

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    { error: { code: 'NOT_FOUND', message: 'Resource not found' } },
    404,
  )
}

export const onError: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      { error: { code: 'HTTP_EXCEPTION', message: err.message } },
      err.status,
    )
  }

  // Keep provider logs free of request data, tokens, and query strings.
  console.error('Unhandled API error', err instanceof Error ? err.name : 'unknown')

  return c.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
    500,
  )
}
