import { hashPassword } from '@vowly/utils'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { argv } from 'node:process'

const API_DIR = resolve(import.meta.dirname, '../workers/api')
const PNPM_COMMAND = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

function parseArgs() {
  const args = argv.slice(2)
  let local = true
  let env: string | null = null
  let dbName = 'vowly-db'
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
    console.error('Usage: tsx database/seed-admin.ts --password <strong-secret> [--local|--remote] [--env staging] [--db vowly-db] [--username admin]')
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

const id = randomUUID()
const sql =
  `INSERT INTO admins (id, username, password_hash, created_at) VALUES ` +
  `('${id}', '${username}', '${hash}', CURRENT_TIMESTAMP) ` +
  `ON CONFLICT(username) DO UPDATE SET password_hash=excluded.password_hash;`

const commandArgs = ['d1', 'execute', dbName, local ? '--local' : '--remote']
if (env) {
  commandArgs.push('--env', env)
}
commandArgs.push('--config', 'wrangler.toml', '--command', JSON.stringify(sql))

console.log(`Seeding admin "${username}" into ${local ? 'local' : 'remote'} database "${dbName}"...`)

try {
  const output = execFileSync(PNPM_COMMAND, ['exec', 'wrangler', ...commandArgs], {
    cwd: API_DIR,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  console.log(output.toString())
  console.log('Done.')
} catch (err) {
  console.error('Seeding failed:', err instanceof Error ? err.message : err)
  process.exit(1)
}
