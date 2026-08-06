export function formatClientCode(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error('Client code sequence must be a positive integer')
  }

  return `CL-${String(sequence).padStart(6, '0')}`
}
