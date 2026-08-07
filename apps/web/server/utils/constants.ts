export const STUDIO_NAME = 'Vowly'

export const DEFAULT_STUDIO = {
  name: STUDIO_NAME,
  instagram: null,
  phone: null,
} as const

export const DEFAULT_PAGE_SIZE = 20

export const CLIENT_SESSION_TTL = 60 * 60 * 24 * 30
export const ADMIN_SESSION_TTL = 60 * 60 * 12
