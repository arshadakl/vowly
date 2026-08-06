export const CLIENT_STATUSES = ['ACTIVE', 'READ_ONLY', 'ARCHIVED', 'DELETED'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export const RSVP_STATUSES = ['yes', 'no', 'maybe'] as const
export type RsvpStatus = (typeof RSVP_STATUSES)[number]

export const EDIT_OVERRIDES = ['force_open', 'force_locked'] as const
export type EditOverride = (typeof EDIT_OVERRIDES)[number]

export const SUBJECT_TYPES = ['admin', 'client'] as const
export type SubjectType = (typeof SUBJECT_TYPES)[number]
