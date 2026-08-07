import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('verifies a generated password hash', async () => {
    const encoded = await hashPassword('correct horse battery staple')

    await expect(verifyPassword('correct horse battery staple', encoded)).resolves.toBe(true)
    await expect(verifyPassword('wrong password', encoded)).resolves.toBe(false)
  })

  it('rejects malformed or unsafe hash parameters', async () => {
    await expect(verifyPassword('password', 'pbkdf2-sha256$NaN$abc$def')).resolves.toBe(false)
    await expect(verifyPassword('password', 'pbkdf2-sha256$999999999$abc$def')).resolves.toBe(false)
  })
})
