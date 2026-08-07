const PASSWORD_FORMAT = 'pbkdf2-sha256'
const ITERATIONS = 310_000
const MIN_SUPPORTED_ITERATIONS = 100_000
const MAX_SUPPORTED_ITERATIONS = 1_000_000
const HASH_LENGTH = 256

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

const webCrypto = globalThis.crypto

async function derivePasswordKey(password: string, salt: Uint8Array, iterations: number) {
  const key = await webCrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  return new Uint8Array(
    await webCrypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations },
      key,
      HASH_LENGTH,
    ),
  )
}

export async function hashPassword(password: string): Promise<string> {
  const salt = webCrypto.getRandomValues(new Uint8Array(16))
  const hash = await derivePasswordKey(password, salt, ITERATIONS)
  return `${PASSWORD_FORMAT}$${ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const [format, iterationText, saltText, hashText] = encoded.split('$')
    const iterations = Number(iterationText)
    if (
      format !== PASSWORD_FORMAT ||
      !saltText ||
      !hashText ||
      !Number.isSafeInteger(iterations) ||
      iterations < MIN_SUPPORTED_ITERATIONS ||
      iterations > MAX_SUPPORTED_ITERATIONS
    )
      return false

    const expected = fromBase64Url(hashText)
    const actual = await derivePasswordKey(password, fromBase64Url(saltText), iterations)
    if (actual.length !== expected.length) return false

    let difference = 0
    for (let i = 0; i < actual.length; i++) difference |= actual[i]! ^ expected[i]!
    return difference === 0
  } catch {
    return false
  }
}
