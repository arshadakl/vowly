# Invitation Template Standards

This document is the single source of truth for building, editing, or reviewing
invitation templates and any code that renders invitation data. Every agent and
developer working on the invitation system must read this before making changes.

---

## 1. Data Contract

Templates receive exactly one prop: `PublicInvitation`. No other types are
available inside a template component. If you need data that is not on this
interface, it must be added to `PublicInvitation` in `packages/types/src/invitation.ts`
first — never reach for internal types like `Invitation` or `EditorInvitation`.

```ts
// This is the only prop a template ever receives
defineProps<{ invitation: PublicInvitation }>()
```

---

## 2. Field Reference — Invitation Level

| Field | Type | Required | Format | Display Guidance |
|-------|------|----------|--------|-----------------|
| `id` | `string` | Yes | UUID | Internal only. Never display to guests. |
| `brideName` | `string` | Yes | Plain text, max 60 chars | Primary heading. Always visible. |
| `groomName` | `string` | Yes | Plain text, max 60 chars | Primary heading. Always visible. Paired with brideName using `&`. |
| `slug` | `string` | Yes | URL-safe slug | Used for share URLs. Never displayed visually in the template. |
| `template` | `TemplateId` | Yes | `'classic' \| 'luxury' \| 'floral'` | Determines which component renders. Not displayed. |
| `quote` | `string \| null` | No | Plain text, max 300 chars | Italic subtitle below names. Wrap in curly quotes. Conditional: `v-if="invitation.quote"` |
| `coverImage` | `string \| null` | No | URL, max 500 chars | Hero background image. Reserved for future use. |
| `brideImage` | `string \| null` | No | URL, max 500 chars | Portrait photo. Reserved for future use. |
| `groomImage` | `string \| null` | No | URL, max 500 chars | Portrait photo. Reserved for future use. |
| `showImages` | `boolean` | Yes | `true \| false` | Controls whether image sections render. Reserved for future use. |
| `featuredVenueEventId` | `string \| null` | No | UUID | Event ID whose venue is featured in a dedicated venue section. Used by `floral` template. When `null`, venue section is hidden. Templates look up the matching event in `events`. |
| `weddingDate` | `string` | Yes | `YYYY-MM-DD` calendar date | Display as `'MMMM D, YYYY'` (e.g. "August 6, 2026"). Also used for countdown. |
| `weddingTz` | `string` | Yes | IANA timezone (e.g. `'Asia/Kolkata'`) | Used by CountdownTimer. Not displayed directly. |
| `events` | `InvitationEvent[]` | Yes | Array (0 or more items) | Rendered as event cards. See section 3. |
| `rsvp` | `{ enabled: boolean }` | Yes | Object | `rsvp.enabled` controls RSVP form visibility on the public page. |
| `ogImageUrl` | `string \| null` | No | URL | Used in `<meta>` tags. Never displayed in template. |
| `studio` | `StudioInfo` | Yes | Object | Photography footer. See section 4. |

---

## 3. Field Reference — Event Level

Each item in `invitation.events` is an `InvitationEvent`:

| Field | Type | Required | Format | Display Guidance |
|-------|------|----------|--------|-----------------|
| `id` | `string` | Yes | UUID | Internal only. Never display. |
| `invitationId` | `string` | Yes | UUID | Internal FK. Never display. |
| `title` | `string` | Yes | Plain text, 1-80 chars | Event card heading. Always visible. |
| `eventDate` | `string` | Yes | `YYYY-MM-DD` | Display as `'MMMM D, YYYY'`. Always visible. |
| `startTime` | `string \| null` | No | `HH:MM` (24-hour) | Show with ` · ` separator. Conditional: `v-if="event.startTime"` |
| `endTime` | `string \| null` | No | `HH:MM` (24-hour) | Show with ` – ` separator. Conditional: `v-if="event.endTime"`. Must be >= startTime. |
| `venue` | `string \| null` | No | Plain text, max 120 chars | Bold venue name. Show if venue OR address is present. |
| `googleMapUrl` | `string \| null` | No | Valid URL, max 500 chars | Clickable map link. Use `@vowly/utils` functions (see section 5). |
| `address` | `string \| null` | No | Plain text, max 500 chars | Smaller text below venue. Show if venue OR address is present. |
| `notes` | `string \| null` | No | Plain text, max 1000 chars | Smaller text below event info. Conditional: `v-if="event.notes"` |
| `sortOrder` | `number` | Yes | Non-negative integer | Display order. Events are pre-sorted by the API. |

### Event Array Behavior

- The `events` array can be **empty** (0 items). Templates must handle this gracefully.
- The array can contain **any number** of events (weddings typically have 1-5).
- Events arrive **pre-sorted** by `sortOrder` from the API. Templates should render
  them in array order without re-sorting.
- Each event is independent — different events can have different venues, dates,
  and optional fields set.

---

## 4. Field Reference — Studio Level

| Field | Type | Required | Format | Display Guidance |
|-------|------|----------|--------|-----------------|
| `name` | `string` | Yes | Plain text | Photography credit. Always visible. |
| `instagram` | `string \| null` | No | Instagram handle (no @) | Render as `https://instagram.com/{handle}`. Conditional: `v-if="studio.instagram"` |
| `phone` | `string \| null` | No | E.164 phone number | Render as `tel:{phone}` link. Conditional: `v-if="studio.phone"` |

The studio section (PhotographyFooter) should only render its social row when
at least one of `instagram` or `phone` is present.

---

## 5. Google Maps Handling

Never handle Google Maps URLs manually. Always use `@vowly/utils`:

```ts
import { isValidGoogleMapsUrl, isShortGoogleMapsLink, googleMapsEmbedUrl, googleMapsOpenUrl } from '@vowly/utils'
```

| Function | Purpose |
|----------|---------|
| `isValidGoogleMapsUrl(url)` | Returns `true` for any Google Maps URL (including short links). Use for validation. |
| `isShortGoogleMapsLink(url)` | Returns `true` for `maps.app.goo.gl` and `goo.gl` links. These **cannot** be embedded in iframes. |
| `googleMapsEmbedUrl(url)` | Returns an embeddable iframe `src`. Returns empty string for short links. |
| `googleMapsOpenUrl(url)` | Returns a reliable "Open in Maps" link that works for all URL formats. |

### Rendering rules

1. **Validate** with `isValidGoogleMapsUrl()` — show error message if invalid.
2. **Check for short link** with `isShortGoogleMapsLink()`:
   - If **short link**: Show a fallback card with MapPin icon, the URL, and an
     "Open map" button using `event.googleMapUrl` as the href.
   - If **full URL**: Show an `<iframe>` with `googleMapsEmbedUrl()` as the src,
     plus an "Open in Google Maps" link below using `googleMapsOpenUrl()`.
3. **Never** pass raw user URLs directly to iframe `src` — always convert first.

---

## 6. Date and Time Standards

| Aspect | Standard |
|--------|----------|
| **Storage format** | `YYYY-MM-DD` (ISO 8601 calendar date) |
| **Display format** | `'MMMM D, YYYY'` via `formatDate()` from `@vueuse/core` |
| **Time format** | `HH:MM` (24-hour, zero-padded) |
| **Timezone** | IANA string (e.g. `Asia/Kolkata`). Used by CountdownTimer only. |
| **Date validation** | `calendarDateSchema` — rejects invalid dates like Feb 30. |
| **Time validation** | `timeSchema` — regex `^(?:[01]\d|2[0-3]):[0-5]\d$` |

### Date display examples

```
Input:  "2026-08-06"  →  Display: "August 6, 2026"
Input:  "2026-12-25"  →  Display: "December 25, 2026"
```

### Time display examples

```
startTime: "10:00", endTime: "11:00"  →  "10:00 – 11:00"
startTime: "18:30", endTime: null     →  "18:30"
startTime: null,    endTime: null     →  (nothing shown)
```

---

## 7. Image Standards

- **Storage**: URLs stored as strings (max 500 chars). Future: R2 object storage.
- **Conditional display**: Only show when `showImages === true` AND the image
  URL is non-null.
- **Cover image**: Full-bleed hero background. Aspect ratio varies by template.
- **Bride/Groom images**: Portrait orientation. Displayed side by side or stacked.
- **Current state**: No template uses images yet. These fields are reserved.
- **Never** store image binary data in D1. Use R2 when image uploads are enabled.

---

## 8. Conditional Rendering Rules

Templates must conditionally render optional fields. Here is the complete list:

| Field | Condition | Reason |
|-------|-----------|--------|
| `invitation.quote` | `v-if="invitation.quote"` | May be null |
| `event.startTime` | `v-if="event.startTime"` | May be null |
| `event.endTime` | `v-if="event.endTime"` | May be null |
| `event.venue` | `v-if="event.venue \|\| event.address"` | Shown if either venue or address exists |
| `event.address` | `v-if="event.venue \|\| event.address"` | Shown if either venue or address exists |
| `event.googleMapUrl` | `v-if="event.googleMapUrl"` | May be null |
| `event.notes` | `v-if="event.notes"` | May be null |
| `studio.instagram` | `v-if="studio.instagram"` | May be null |
| `studio.phone` | `v-if="studio.phone"` | May be null |
| RSVP section | `v-if="invitation.rsvp.enabled"` | Controlled by client setting |
| Image sections | `v-if="invitation.showImages && invitation.brideImage"` | Both flag and URL must be truthy |

---

## 9. Template Component Contract

### Props

```ts
// The ONLY prop interface for templates
interface TemplateProps {
  invitation: PublicInvitation
}
```

### Allowed imports

Templates may import from:

- `@vueuse/core` — `formatDate()`, `useClipboard()`
- `@vowly/utils` — Google Maps helpers, date helpers, countdown
- `lucide-vue-next` — Icons
- Vue APIs — `computed`, `ref`, etc.

Templates must NOT import from:

- Internal server types (`Invitation`, `EditorInvitation`, etc.)
- `~/types/client-wizard` — editor-only types
- Any `~/server/*` modules

### Behavior rules

- **No side effects**: Templates must not mutate `invitation` data.
- **No navigation**: Templates must not call `navigateTo()` or `router.push()`.
- **External links**: Always `target="_blank" rel="noopener noreferrer"`.
- **Responsive**: Must work on mobile (320px+) and desktop.
- **Accessibility**: Use semantic HTML. Interactive elements must be keyboard-accessible.
- **Date formatting**: Always use `formatDate()` from `@vueuse/core`.
- **Clipboard**: Use `useClipboard()` from `@vueuse/core` for copy operations.

---

## 10. Template Registration Checklist

When adding a new template:

1. **Define the template ID** in `packages/types/src/template.ts`:
   - Add to `TEMPLATE_IDS` array
   - Add to `TEMPLATE_DEFINITIONS` with `id`, `name`, `description`, `ogTheme`

2. **Create the component** at `apps/web/app/components/templates/<id>/<Id>Template.vue`:
   - Accept `defineProps<{ invitation: PublicInvitation }>`
   - Follow all field rendering rules from this document
   - Handle all conditional fields with `v-if`
   - Use `@vowly/utils` for Google Maps, not raw URL handling

3. **Register** in `apps/web/app/utils/templates.ts`:
   - Add lazy-loaded entry to `templateComponents`

4. **Update mock data** in `apps/web/app/utils/mock-invitation.ts`:
   - Populate any new fields used by the template

5. **Verify**:
   - Template renders with empty events array
   - Template renders with all optional fields null
   - Template renders with all optional fields populated
   - Responsive on mobile and desktop
   - No lint or typecheck errors

---

## 11. Agent Instructions

Any agent working on templates or invitation-related code must:

1. **Read this document first** — `docs/template-standards.md`
2. **Only use fields on `PublicInvitation`** — never reach for internal types
3. **Use `@vowly/utils`** for shared logic (Google Maps, dates, etc.)
4. **Follow conditional rendering rules** for all optional fields
5. **Never store images in D1** — use R2 when image uploads are enabled
6. **Never log passcodes, query strings, or session tokens**
7. **Run `pnpm lint` and `pnpm typecheck`** before completing any task
