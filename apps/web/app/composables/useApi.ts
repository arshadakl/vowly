/**
 * Thin same-origin fetch wrapper for Nuxt server API handlers.
 */
export function useApi() {
  const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  return $fetch.create({
    baseURL: '/api',
    headers,
    credentials: 'include',
    onResponseError(context) {
      const data = context.response._data as { error?: { message?: string } } | undefined
      throw new Error(data?.error?.message ?? context.response.statusText)
    },
  })
}
