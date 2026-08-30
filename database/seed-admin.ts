import { hashPassword } from '@vowly/utils'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { argv } from 'node:process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const isWin32 = process.platform === 'win32'
const PNPM_COMMAND = isWin32 ? 'pnpm.cmd' : 'pnpm'

function parseArgs() {
  const args = argv.slice(2)
  let local = true
  let env: string | null = null
  let dbName = 'vowly'
  let username = 'admin'
  let password = ''

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--local') local = true
    else if (arg === '--remote') local = false
    else if (arg === '--env' && args[i + 1]) env = args[++i]
    else if (arg === '--db' && args[i + 1]) dbName = args[++i]
    else if (arg === '--username' && args[i + 1]) username = args[++i]
    else if (arg === '--password' && args[i + 1]) password = args[++i]
  }

  if (!password) {
    console.error(
      'Usage: tsx database/seed-admin.ts --password <strong-secret> [--local|--remote] [--env staging] [--db vowly] [--username admin]',
    )
    process.exit(1)
  }

  return { local, env, dbName, username, password }
}

const { local, env, dbName, username, password } = parseArgs()

if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
  console.error('Invalid username. Use only letters, numbers, underscores, dots and hyphens.')
  process.exit(1)
}

const hash = await hashPassword(password)

if (local) {
  const { DatabaseSync } = await import('node:sqlite')
  const d1Dir = join(process.cwd(), 'apps', 'web', '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject')
  const files = readdirSync(d1Dir).filter(f => f.endsWith('.sqlite') && !f.startsWith('metadata'))
  if (files.length === 0) {
    console.error('No local D1 database found. Run db:migrate:local first.')
    process.exit(1)
  }
  const dbPath = join(d1Dir, files[0])
  console.log(`Seeding admin "${username}" into local D1 (${dbPath})...`)
  const db = new DatabaseSync(dbPath, { open: true })
  const id = randomUUID()
  db.prepare(
    "INSERT INTO admins (id, username, password_hash, created_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash",
  ).run(id, username, hash)
  db.close()
  console.log('Done.')
} else {
  const id = randomUUID()
  const quoteSql = (value: string) => `'${value.replace(/'/g, "''")}'`
  const sql = `INSERT INTO admins (id, username, password_hash, created_at) VALUES (${quoteSql(id)}, ${quoteSql(username)}, ${quoteSql(hash)}, CURRENT_TIMESTAMP) ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash;`

  const tmpFile = join(process.cwd(), '.tmp-sql-command.sql')
  const { writeFileSync, unlinkSync } = await import('node:fs')
  writeFileSync(tmpFile, sql, 'utf-8')

  const commandArgs = ['d1', 'execute', dbName, '--remote']
  if (env) commandArgs.push('--env', env)
  commandArgs.push('--config', 'wrangler.toml', '--file', tmpFile)

  console.log(`Seeding admin "${username}" into remote database "${dbName}"...`)
  try {
    const output = execFileSync(PNPM_COMMAND, ['exec', 'wrangler', ...commandArgs], {
      shell: isWin32,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    console.log(output.toString())
    console.log('Done.')
  } catch (err) {
    console.error('Seeding failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  } finally {
    try { unlinkSync(tmpFile) } catch {}
  }
}
