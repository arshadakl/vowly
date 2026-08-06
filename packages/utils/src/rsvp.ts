export interface RateLimitWindow {
  count: number
  resetAt: number
}

export function nextRateLimitWindow(
  current: RateLimitWindow | null,
  now: number,
  limit: number,
  windowMs: number,
): { allowed: boolean; window: RateLimitWindow } {
  const window = current && current.resetAt > now
    ? { count: current.count + 1, resetAt: current.resetAt }
    : { count: 1, resetAt: now + windowMs }
  return { allowed: window.count <= limit, window }
}

export function ownsInvitation(clientId: string, invitationClientId: string): boolean {
  return clientId.length > 0 && clientId === invitationClientId
}
