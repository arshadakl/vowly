/**
 * Passcode alphabet avoids confusing characters: 0/O, 1/I/l.
 * The spec example uses `78do8z`, so `o` is allowed.
 */
const PASSCODE_ALPHABET = 'abcdefghjkmnopqrstuvwxyz23456789'
const PASSCODE_LENGTH = 6
const PASSCODE_REGEX = new RegExp(`^[${PASSCODE_ALPHABET}]{6}$`)

/**
 * Generate a cryptographically random, human-friendly passcode.
 * Uses rejection sampling to remove modulo bias.
 */
export function generatePasscode(length = PASSCODE_LENGTH, alphabet = PASSCODE_ALPHABET): string {
  const maxValid = Math.floor(256 / alphabet.length) * alphabet.length
  const result: string[] = []
  const buffer = new Uint8Array(length * 2)

  while (result.length < length) {
    crypto.getRandomValues(buffer)
    for (const byte of buffer) {
      if (byte >= maxValid) continue
      result.push(alphabet[byte % alphabet.length]!)
      if (result.length === length) break
    }
  }

  return result.join('')
}

/** Validate that a passcode matches the canonical format. */
export function isValidPasscode(value: string): boolean {
  return PASSCODE_REGEX.test(value)
}
