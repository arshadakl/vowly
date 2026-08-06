/**
 * Thin fetch wrapper that points at the API worker.
 * In production the API is on the same origin under /api/*, so the base URL is empty.
 * In local development NUXT_PUBLIC_API_BASE should point at the worker dev server.
 */
export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase.replace(/\/$/, '')

  return $fetch.create({
    baseURL: `${base}/api`,
    credentials: 'include',
    onResponseError(context) {
      const data = context.response._data as { error?: { message?: string } } | undefined
      throw new Error(data?.error?.message ?? context.response.statusText)
    },
  })
}
