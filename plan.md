# Wedding Invitation & Management System (Project Specification)

> Version: 1.0
>
> This document is the complete implementation specification for the Coding Agent.
>
> **Goal**
>
> Build a modern Wedding Invitation & Client Management System for a wedding photography company.
>
> The system should allow the photography company (Admin) to create invitation projects for clients while allowing clients to manage only their own invitation until the wedding date.
>
> This is **NOT** a generic invitation generator.
>
> It is a complete invitation management platform.

---

# 1. Tech Stack

## Frontend

- Nuxt (Latest Stable)
- Vue 3
- TypeScript
- Tailwind CSS
- VueUse
- Motion (Vue) / Native CSS animations
- GSAP only if absolutely necessary (avoid in V1)

---

## Backend

Cloudflare Workers

Requirements

- REST API
- TypeScript
- Hono (recommended)
- Zod Validation

---

## Database

Cloudflare D1 (SQLite)

---

## File Storage

Cloudflare R2

Store

- Cover Images
- Bride Images
- Groom Images
- Generated OpenGraph Images

Never store images inside D1.

---

## Hosting

Cloudflare Pages

Everything should remain inside Cloudflare.

---

# 2. User Roles

There are only two roles.

## Admin

Photography Company

Capabilities

- Login
- Create Client
- Manage Clients
- Edit Any Invitation
- Unlock Editing
- Archive Invitation
- Delete Invitation
- Dashboard

---

## Client

Wedding Couple

Capabilities

- Login
- Fill Invitation Data
- Edit Own Invitation
- Preview
- Publish
- Share

Clients cannot

- Change Slug
- Delete Invitation
- Reuse Invitation
- Edit after event lock

---

# 3. Authentication

## Admin Login

Username

Password

Simple authentication.

---

## Client Login

Authentication uses

Passcode

+

Phone Number

Example

Passcode

```
78do8z
```

Phone

```
9876543210
```

Both must match.

---

## Magic Login Link

Admin can share

```
/login?key=78do8z
```

The passcode field should automatically fill.

Client only enters phone number.

---

## Failed Login Protection

Maximum

```
10
```

failed attempts.

After that

Temporarily lock login.

Use Cloudflare rate limiting.

---

# 4. Admin Dashboard

Dashboard cards

- Upcoming Weddings
- Today's Weddings
- Completed Weddings
- Archived Invitations

Search

Filter

Pagination

---

# 5. Client Creation

Admin creates client.

Required

Client Name

Phone Number

Wedding Date

System automatically generates

Client ID

Example

```
CL-000001
```

Passcode

Example

```
78do8z
```

Status

```
ACTIVE
```

---

# 6. Client Status

Possible values

ACTIVE

READ_ONLY

ARCHIVED

DELETED

---

# 7. Invitation Data

Every invitation belongs to one client.

Fields

Bride Name

Groom Name

Bride Image (optional)

Groom Image (optional)

Cover Image (optional)

Wedding Quote (optional)

Template

Published

Published Date

Editable Until

---

# 8. Dynamic Events

Invitation supports unlimited events.

Examples

Reception

Wedding

Nikah

Haldi

Mehendi

Engagement

Dinner

Or any custom title.

Each event contains

Title

Date

Start Time

End Time (optional)

Venue Name

Google Maps URL (optional)

Manual Address

Notes (optional)

Unlimited events.

Never hardcode event types.

---

# 9. Location

Support

Google Maps URL

or

Manual Address

Future support

Latitude / Longitude

---

# 10. Invitation Templates

Initial templates

Classic

Luxury

Requirements

Templates are Vue Components.

Example

```
ClassicTemplate.vue

LuxuryTemplate.vue
```

Every template receives the same invitation object.

No duplicated business logic.

Templates only change presentation.

---

# 11. Live Preview

Client can switch

Desktop

Tablet

Mobile

Preview updates instantly.

---

# 12. Publishing

Publish button creates

Public URL

Example

```
/arshad-fathima-06-08-26
```

---

# 13. Slug Generation

Slug is generated automatically.

Source

Bride Name

+

Groom Name

+

Wedding Date

Example

```
Arshad

Fathima

06-08-2026
```

↓

```
arshad-fathima-06-08-26
```

Normalize

- lowercase
- remove symbols
- remove extra spaces
- kebab-case

---

## Slug Collision

If slug exists

Generate

```
arshad-fathima-06-08-26-2
```

Next

```
arshad-fathima-06-08-26-3
```

Never expose slug editing.

Clients cannot edit slug.

Admin cannot manually edit slug.

Slug is permanent.

---

# 14. Editing Rules

Client can edit until

Wedding Date ends.

Example

Wedding

```
06-08-2026
```

Editable until end of that day.

Next day

Automatically

READ ONLY

Client sees

```
This invitation is now locked because the event has ended.
```

Edit buttons disappear.

---

## Admin Override

Admin can

Enable Editing

Disable Editing

Regardless of date.

---

# 15. Invitation Features

V1

Countdown Timer

Google Maps Button

Copy Address

Add To Calendar

QR Code

Responsive Layout

Optional RSVP

---

# 16. Countdown

Show

Days

Hours

Minutes

Seconds

After event

Display

```
Thank you for celebrating with us ❤️
```

---

# 17. RSVP

Optional

Admin enables/disables.

Client can enable during setup if admin allows.

Guest

Yes

No

Maybe

Guest Count

Dashboard shows totals.

---

# 18. QR Code

Automatically generated.

QR opens invitation URL.

Visible inside invitation.

---

# 19. OpenGraph Image

Every invitation should generate an OpenGraph image.

Purpose

WhatsApp preview

Facebook

Telegram

LinkedIn

Discord

Example layout

```
Wedding Invitation

Arshad

&

Fathima

06 August 2026
```

The design should follow the selected template style.

Generate once during publish.

Store inside Cloudflare R2.

Save URL in database.

Add metadata

```
og:image
twitter:image
```

---

# 20. Share Features

Buttons

Copy Link

Share WhatsApp

QR Code

---

# 21. Image Upload

Store inside

Cloudflare R2

Supported

Cover

Bride

Groom

Future Gallery

---

# 22. Public Invitation

Public page should include

Hero

Bride

Groom

Countdown

Events

Google Maps

Copy Address

QR

RSVP (optional)

Photography Footer

---

# 23. Photography Footer

Always visible.

Example

```
Captured with ❤️

Dream Frame Photography

Instagram

Phone Number
```

Admin configurable.

---

# 24. Security

Clients cannot

Edit slug

Delete invitation

Reuse invitation

Access another client

Guess IDs

Use

Random passcodes.

Separate

Client ID

Passcode

Slug

---

# 25. IDs

Internal Client ID

Example

```
CL-000001
```

Never public.

---

Passcode

Example

```
78do8z
```

Only for login.

---

Slug

Example

```
arshad-fathima-06-08-26
```

Only for public URLs.

---

# 26. Database Design

## Admin

- id
- username
- password_hash
- created_at

---

## Clients

- id
- client_code
- name
- phone
- passcode
- status
- wedding_date
- created_at

---

## Invitations

- id
- client_id
- bride_name
- groom_name
- slug
- template
- cover_image
- bride_image
- groom_image
- quote
- editable_until
- published
- published_at
- og_image_url
- created_at
- updated_at

---

## Events

- id
- invitation_id
- title
- event_date
- start_time
- end_time
- venue
- google_map
- address
- notes
- sort_order

---

## RSVP

- id
- invitation_id
- guest_name
- status
- guest_count
- created_at

---

# 27. API Principles

Use REST APIs.

Validate all requests with Zod.

Never trust frontend input.

Use proper HTTP status codes.

---

# 28. UI Design Principles

Modern

Minimal

Luxury

Mobile First

Responsive

Fast

Elegant animations

Accessible

No unnecessary effects.

---

# 29. Project Structure

```
apps/
    web/

packages/
    ui/
    types/
    utils/

workers/
    api/

database/

shared/
```

Use clean architecture.

Separate

- Components
- Composables
- API
- Validation
- Database
- Utilities

---

# 30. Future Features (Not V1)

Guest Book

Gallery

Background Music

Confetti

Multiple Languages

Analytics

Custom Domains

Photo Gallery

Wedding Timeline

Admin Multi-Tenant

Payment System

---

# 31. Development Standards

- Strict TypeScript
- ESLint
- Prettier
- Reusable components
- No duplicated logic
- Proper error handling
- Responsive by default
- Strong typing everywhere
- Server-side validation
- Clean folder structure
- Production-ready code

---

# 32. Primary Objective

Deliver a polished, premium-quality wedding invitation management platform that feels modern, elegant, and effortless to use for both the photography studio and the wedding couple.

Every design decision should prioritize:

- Simplicity for non-technical users.
- Long-term maintainability.
- Clean architecture.
- Performance on Cloudflare.
- Mobile-first experience.
- A premium visual experience suitable for luxury wedding brands.