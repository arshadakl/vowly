# Cloudinary setup for invitation photos

Vowly uses Cloudinary only for client-uploaded couple photos. Template graphics, fonts, and optional audio
remain versioned project assets. Do not create or alter Cloudinary resources from application code or local
verification.

## Account and environment

Create separate staging and production Cloudinary environments. Add these encrypted Worker/Pages secrets:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CLOUDINARY_UPLOAD_PRESET
```

Never expose `CLOUDINARY_API_SECRET` through Nuxt public runtime config, client responses, logs, or source
control. Only cloud name, API key, scoped public ID, timestamp, allowlisted parameters, and the generated
signature are returned to an authenticated browser.

## Signed upload preset

Create a signed image upload preset with these controls:

- image resource type only;
- JPG, PNG, WebP, and AVIF formats;
- maximum 10 MB input and maximum 5,000 px dimensions;
- metadata stripping appropriate for public wedding photos;
- unique filenames/public IDs with overwrite disabled;
- no incoming transformation that conflicts with the browser's 4:5 crop;
- no unsigned uploads.

The server signs a unique path under `vowly/invitations/<invitation-id>/couple/`. The confirmation endpoint
uses the authenticated Cloudinary Admin API to verify account, resource type, asset ID, public ID, version,
format, dimensions, and byte size before D1 is updated.

## Delivery and deletion

Public pages construct delivery URLs only from verified metadata. The default transformation uses portrait
crop, automatic gravity, automatic quality, and automatic format. Image bytes travel directly between the
browser and Cloudinary and are never proxied through the Worker.

On replacement or removal, Vowly updates D1 first and then calls Cloudinary's signed Destroy API. Failed
remote deletions must be monitored and reconciled without restoring the old D1 reference. Configure asset
retention and backup policy in the Cloudinary console according to the project's privacy policy.

## Operations checklist

- Confirm the CSP permits `res.cloudinary.com` images and `api.cloudinary.com` upload requests only.
- Configure quota alerts for storage, transformations, bandwidth, and Admin API usage.
- Test signed upload, verification, optimized delivery, replacement, and deletion in staging.
- Mock all Cloudinary traffic in automated tests; tests must never upload real assets.
- Back up D1 before production migrations. Asset IDs in the backup are the reconciliation source.
- During rollback, keep Cloudinary credentials available while any deployed version references its assets.
