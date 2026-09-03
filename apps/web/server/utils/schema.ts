import { sql } from 'drizzle-orm'
import { TEMPLATE_FONT_IDS, TEMPLATE_IDS } from '@vowly/types'
import { sqliteTable, text, integer, index, primaryKey } from 'drizzle-orm/sqlite-core'

export const admins = sqliteTable('admins', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
export const clients = sqliteTable(
  'clients',
  {
    id: text('id').primaryKey(),
    clientCode: text('client_code').notNull().unique(),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    passcode: text('passcode').notNull().unique(),
    status: text('status', { enum: ['ACTIVE', 'READ_ONLY', 'ARCHIVED', 'DELETED'] })
      .notNull()
      .default('ACTIVE'),
    weddingDate: text('wedding_date').notNull(),
    weddingTz: text('wedding_tz').notNull().default('Asia/Kolkata'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_clients_status').on(table.status),
    index('idx_clients_wedding_date').on(table.weddingDate),
  ],
)
export const invitations = sqliteTable(
  'invitations',
  {
    id: text('id').primaryKey(),
    clientId: text('client_id')
      .notNull()
      .unique()
      .references(() => clients.id),
    brideName: text('bride_name').notNull().default(''),
    groomName: text('groom_name').notNull().default(''),
    slug: text('slug').unique(),
    template: text('template', { enum: TEMPLATE_IDS }),
    brideParents: text('bride_parents'),
    groomParents: text('groom_parents'),
    coverImage: text('cover_image'),
    brideImage: text('bride_image'),
    groomImage: text('groom_image'),
    showImages: integer('show_images', { mode: 'boolean' }).notNull().default(false),
    quote: text('quote'),
    editOverride: text('edit_override', { enum: ['force_open', 'force_locked'] }),
    rsvpEnabled: integer('rsvp_enabled', { mode: 'boolean' }).notNull().default(false),
    featuredVenueEventId: text('featured_venue_event_id'),
    coupleImageAssetId: text('couple_image_asset_id'),
    coupleImagePublicId: text('couple_image_public_id'),
    coupleImageVersion: integer('couple_image_version'),
    coupleImageFormat: text('couple_image_format'),
    coupleImageWidth: integer('couple_image_width'),
    coupleImageHeight: integer('couple_image_height'),
    published: integer('published', { mode: 'boolean' }).notNull().default(false),
    publishedAt: text('published_at'),
    ogImageUrl: text('og_image_url'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('idx_invitations_published').on(table.published)],
)
export const invitationTemplateCustomizations = sqliteTable(
  'invitation_template_customizations',
  {
    invitationId: text('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    templateId: text('template_id', { enum: TEMPLATE_IDS }).notNull(),
    version: integer('version').notNull().default(1),
    fontFamily: text('font_family', { enum: TEMPLATE_FONT_IDS }).notNull().default('cinzel'),
    fontSize: integer('font_size').notNull().default(14),
    showEvents: integer('show_events', { mode: 'boolean' }).notNull().default(true),
    musicEnabled: integer('music_enabled', { mode: 'boolean' }).notNull().default(false),
    textJson: text('text_json').notNull().default('{}'),
    stylesJson: text('styles_json').notNull().default('{}'),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.invitationId, table.templateId] }),
    index('idx_template_customizations_invitation').on(table.invitationId),
  ],
)
export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    invitationId: text('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    eventDate: text('event_date').notNull(),
    startTime: text('start_time'),
    endTime: text('end_time'),
    venue: text('venue'),
    googleMap: text('google_map'),
    googleMapEmbed: text('google_map_embed'),
    address: text('address'),
    notes: text('notes'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [index('idx_events_invitation_id').on(table.invitationId)],
)
export const rsvps = sqliteTable(
  'rsvps',
  {
    id: text('id').primaryKey(),
    invitationId: text('invitation_id')
      .notNull()
      .references(() => invitations.id, { onDelete: 'cascade' }),
    guestName: text('guest_name').notNull(),
    status: text('status', { enum: ['yes', 'no', 'maybe'] }).notNull(),
    guestCount: integer('guest_count').notNull().default(1),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('idx_rsvps_invitation_id').on(table.invitationId)],
)
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    subjectType: text('subject_type', { enum: ['admin', 'client'] }).notNull(),
    subjectId: text('subject_id').notNull(),
    tokenHash: text('token_hash').notNull().unique(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    expiresAt: text('expires_at').notNull(),
    lastSeenAt: text('last_seen_at'),
    ip: text('ip'),
    userAgent: text('user_agent'),
  },
  (table) => [
    index('idx_sessions_subject_id').on(table.subjectId),
    index('idx_sessions_expires_at').on(table.expiresAt),
  ],
)
