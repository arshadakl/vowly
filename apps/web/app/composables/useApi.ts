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
      return await requestFetch<T>(request, { baseURL: '/api', ...options })
    } catch (error: unknown) {
      const data = (error as { response?: { _data?: { error?: { message?: string } } } }).response?._data
      throw new Error(data?.error?.message ?? (error instanceof Error ? error.message : 'Request failed'))
    }
  }
}
