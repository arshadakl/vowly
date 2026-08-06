import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './apps/web/server/utils/schema.ts',
  out: './database/migrations',
})
