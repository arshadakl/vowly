import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const admins = sqliteTable('admins', {
  id: text('id').primaryKey(), username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(), createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
})
export const clients = sqliteTable('clients', {
  id: text('id').primaryKey(), clientCode: text('client_code').notNull().unique(), name: text('name').notNull(),
  phone: text('phone').notNull(), passcode: text('passcode').notNull().unique(),
  status: text('status', { enum: ['ACTIVE', 'READ_ONLY', 'ARCHIVED', 'DELETED'] }).notNull().default('ACTIVE'),
  weddingDate: text('wedding_date').notNull(), weddingTz: text('wedding_tz').notNull().default('Asia/Kolkata'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
}, (table) => [index('idx_clients_status').on(table.status), index('idx_clients_wedding_date').on(table.weddingDate)])
export const invitations = sqliteTable('invitations', {
  id: text('id').primaryKey(), clientId: text('client_id').notNull().unique().references(() => clients.id),
  brideName: text('bride_name').notNull().default(''), groomName: text('groom_name').notNull().default(''), slug: text('slug').unique(),
  template: text('template', { enum: ['classic', 'luxury'] }).notNull().default('classic'), coverImage: text('cover_image'),
  brideImage: text('bride_image'), groomImage: text('groom_image'), quote: text('quote'),
  editOverride: text('edit_override', { enum: ['force_open', 'force_locked'] }), rsvpEnabled: integer('rsvp_enabled', { mode: 'boolean' }).notNull().default(false),
  published: integer('published', { mode: 'boolean' }).notNull().default(false), publishedAt: text('published_at'), ogImageUrl: text('og_image_url'),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'), updatedAt: text('updated_at').notNull().default('CURRENT_TIMESTAMP'),
}, (table) => [uniqueIndex('idx_invitations_slug').on(table.slug), index('idx_invitations_published').on(table.published)])
export const events = sqliteTable('events', {
  id: text('id').primaryKey(), invitationId: text('invitation_id').notNull().references(() => invitations.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), eventDate: text('event_date').notNull(), startTime: text('start_time'), endTime: text('end_time'), venue: text('venue'),
  googleMap: text('google_map'), address: text('address'), notes: text('notes'), sortOrder: integer('sort_order').notNull().default(0),
}, (table) => [index('idx_events_invitation_id').on(table.invitationId)])
export const rsvps = sqliteTable('rsvps', {
  id: text('id').primaryKey(), invitationId: text('invitation_id').notNull().references(() => invitations.id, { onDelete: 'cascade' }),
  guestName: text('guest_name').notNull(), status: text('status', { enum: ['yes', 'no', 'maybe'] }).notNull(), guestCount: integer('guest_count').notNull().default(1), createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'),
}, (table) => [index('idx_rsvps_invitation_id').on(table.invitationId)])
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), subjectType: text('subject_type', { enum: ['admin', 'client'] }).notNull(), subjectId: text('subject_id').notNull(), tokenHash: text('token_hash').notNull().unique(),
  createdAt: text('created_at').notNull().default('CURRENT_TIMESTAMP'), expiresAt: text('expires_at').notNull(), lastSeenAt: text('last_seen_at'), ip: text('ip'), userAgent: text('user_agent'),
}, (table) => [index('idx_sessions_subject_id').on(table.subjectId), index('idx_sessions_expires_at').on(table.expiresAt)])
