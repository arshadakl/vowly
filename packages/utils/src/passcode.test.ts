import { describe, expect, it } from 'vitest'
import { generatePasscode, isValidPasscode } from './passcode'

describe('generatePasscode', () => {
  it('produces a 6-character passcode', () => {
    expect(generatePasscode()).toHaveLength(6)
  })

  it('only uses allowed characters', () => {
    const passcode = generatePasscode()
    expect(isValidPasscode(passcode)).toBe(true)
  })

  it('can generate a longer passcode', () => {
    expect(generatePasscode(8)).toHaveLength(8)
  })

  it('avoids ambiguous characters', () => {
    for (let i = 0; i < 100; i++) {
      const code = generatePasscode()
      expect(code).not.toMatch(/[0il1]/)
    }
  })
})

describe('isValidPasscode', () => {
  it('accepts valid codes', () => {
    expect(isValidPasscode('78do8z')).toBe(true)
  })

  it('rejects ambiguous characters', () => {
    expect(isValidPasscode('78do0z')).toBe(false)
    expect(isValidPasscode('78dilz')).toBe(false)
  })
})
