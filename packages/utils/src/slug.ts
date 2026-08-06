/**
 * Normalise a name so it can become a URL-safe slug segment.
 * - lowercases
 * - removes combining diacritics
 * - replaces every non-alphanumeric run with a single hyphen
 * - trims leading/trailing hyphens
 */
export function normalizeNamePart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Convert an ISO date (YYYY-MM-DD) into the DD-MM-YY representation used in slugs.
 */
export function formatSlugDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year!.slice(2)}`
}

/**
 * Build the base slug from bride name, groom name and wedding date.
 * The order is fixed at publish time and becomes permanent.
 */
export function buildBaseSlug(brideName: string, groomName: string, weddingDate: string): string {
  const parts = [
    normalizeNamePart(brideName),
    normalizeNamePart(groomName),
    formatSlugDate(weddingDate),
  ]
  return parts.filter(Boolean).join('-')
}

/**
 * Resolve slug collisions by appending `-2`, `-3`, etc.
 * `taken` should contain all existing slugs in the database.
 */
export function resolveSlug(base: string, taken: readonly string[]): string {
  if (!taken.includes(base)) return base
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`
    if (!taken.includes(candidate)) return candidate
  }
}
