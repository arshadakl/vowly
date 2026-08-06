export interface Env {
  DB: D1Database
  MEDIA: R2Bucket
  RATE_LIMIT: KVNamespace
  APP_NAME: string
  ENVIRONMENT: 'production' | 'staging'
}
