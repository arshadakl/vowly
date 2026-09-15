/**
 * Passcode alphabet avoids confusing characters: 0/O, 1/I/l.
 * The spec example uses `78do8z`, so `o` is allowed.
 */
const PASSCODE_ALPHABET = 'abcdefghjkmnopqrstuvwxyz23456789'
const PASSCODE_LENGTH = 6
const PASSCODE_REGEX = new RegExp(`^[${PASSCODE_ALPHABET}]{6}$`)

const PASSCODE_HASH_FORMAT = 'pbkdf2-sha256-passcode'
const PASSCODE_ITERATIONS = 100_000
const PASSCODE_HASH_LENGTH = 256

/**
 * Generate a cryptographically random, human-friendly passcode.
 * Uses rejection sampling to remove modulo bias.
 */
const webCrypto = globalThis.crypto

export function generatePasscode(length = PASSCODE_LENGTH, alphabet = PASSCODE_ALPHABET): string {
  const maxValid = Math.floor(256 / alphabet.length) * alphabet.length
  const result: string[] = []
  const buffer = new Uint8Array(length * 2)

  while (result.length < length) {
    webCrypto.getRandomValues(buffer)
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

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function derivePasscodeKey(passcode: string, salt: Uint8Array, iterations: number) {
  const key = await webCrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passcode),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  return new Uint8Array(
    await webCrypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
      key,
      PASSCODE_HASH_LENGTH,
    ),
  )
}

export async function hashPasscode(passcode: string): Promise<string> {
  const salt = webCrypto.getRandomValues(new Uint8Array(16))
  const hash = await derivePasscodeKey(passcode, salt, PASSCODE_ITERATIONS)
  return `${PASSCODE_HASH_FORMAT}$${PASSCODE_ITERATIONS}$${toBase64Url(salt)}${toBase64Url(hash)}`
}

export async function verifyPasscode(passcode: string, encoded: string): Promise<boolean> {
  try {
    if (encoded.startsWith(PASSCODE_HASH_FORMAT + '$')) {
      const [format, iterationText, rest] = encoded.split('$')
      const iterations = Number(iterationText)
      if (
        format !== PASSCODE_HASH_FORMAT ||
        !rest ||
        !Number.isSafeInteger(iterations) ||
        iterations < PASSCODE_ITERATIONS
      )
        return false

      const salt = fromBase64Url(rest.slice(0, 22))
      const expected = fromBase64Url(rest.slice(22))
      const actual = await derivePasscodeKey(passcode, salt, iterations)
      if (actual.length !== expected.length) return false

      let difference = 0
      for (let i = 0; i < actual.length; i++) difference |= actual[i]! ^ expected[i]!
      return difference === 0
    }

    if (PASSCODE_REGEX.test(encoded)) {
      return passcode === encoded
    }

    return false
  } catch {
    return false
  }
}
