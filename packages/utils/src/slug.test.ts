import { describe, expect, it } from 'vitest'
import { buildBaseSlug, formatSlugDate, normalizeNamePart, resolveSlug } from './slug'

describe('normalizeNamePart', () => {
  it('lowercases and removes symbols', () => {
    expect(normalizeNamePart('Arshad & Fathima!')).toBe('arshad-fathima')
  })

  it('strips diacritics', () => {
    expect(normalizeNamePart('Fáññy & Joël')).toBe('fanny-joel')
  })

  it('trims leading/trailing hyphens', () => {
    expect(normalizeNamePart('  ---hello!!!')).toBe('hello')
  })
})

describe('formatSlugDate', () => {
  it('formats ISO date to DD-MM-YY', () => {
    expect(formatSlugDate('2026-08-06')).toBe('06-08-26')
  })
})

describe('buildBaseSlug', () => {
  it('matches the spec example', () => {
    expect(buildBaseSlug('Arshad', 'Fathima', '2026-08-06')).toBe('arshad-fathima-06-08-26')
  })
})

describe('resolveSlug', () => {
  it('returns base when free', () => {
    expect(resolveSlug('a-b', [])).toBe('a-b')
  })

  it('appends collision suffixes', () => {
    const taken = ['a-b', 'a-b-2', 'a-b-3']
    expect(resolveSlug('a-b', taken)).toBe('a-b-4')
  })

  it('never loops unboundedly when every candidate is taken', () => {
    const taken = Array.from({ length: 10_000 }, (_, i) => (i === 0 ? 'a-b' : `a-b-${i}`))
    const result = resolveSlug('a-b', taken)
    expect(result.startsWith('a-b-')).toBe(true)
  })
})
