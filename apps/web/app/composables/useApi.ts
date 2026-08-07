import type { FetchOptions } from 'ofetch'

type ApiFetch = <T>(request: string, options?: FetchOptions) => Promise<T>

/**
 * Thin same-origin fetch wrapper for Nuxt server API handlers.
 * On the server it routes through `useRequestFetch()` so the underlying
 * event context (Cloudflare bindings, cookies) is preserved.
 */
export function useApi() {
  const requestFetch = useRequestFetch() as ApiFetch
  return async function api<T>(request: string, options: FetchOptions = {}): Promise<T> {
    try {
      return await requestFetch<T>(request, {
        baseURL: '/api',
        credentials: 'same-origin',
        ...options,
      })
    } catch (error: unknown) {
      const response = (
        error as {
          response?: { status?: number; _data?: { error?: { code?: string; message?: string } } }
        }
      ).response
      const data = response?._data?.error
      const apiErr = new Error(
        data?.message ?? (error instanceof Error ? error.message : 'Request failed'),
      ) as Error & { statusCode: number; code: string }
      if (response?.status) apiErr.statusCode = response.status
      if (data?.code) apiErr.code = data.code
      throw apiErr
    }
  }
}
