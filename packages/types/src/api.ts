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
