import { describe, expect, it } from 'vitest'
import { formatClientCode } from './client-code'

describe('formatClientCode', () => {
  it('formats the first client code with six digits', () => {
    expect(formatClientCode(1)).toBe('CL-000001')
  })

  it('does not truncate larger sequences', () => {
    expect(formatClientCode(1000000)).toBe('CL-1000000')
  })

  it('rejects invalid sequences', () => {
    expect(() => formatClientCode(0)).toThrow()
    expect(() => formatClientCode(1.5)).toThrow()
  })
})
