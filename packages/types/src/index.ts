export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export * from './enums'
export * from './template'
export * from './event'
export * from './invitation'
export * from './client'
export * from './auth'
export * from './rsvp'
export * from './api'
