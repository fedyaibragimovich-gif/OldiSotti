# Audit fixes — 13 September 2026

Base: 5824762. This branch is a reviewable change; production has not been updated.

## Implemented

- Materialized existing prebuild transformations into checked-in components; removed the prebuild hook and one-off write-to-main repair workflows.
- Private listing reads are restricted to owners/admins. New listing status follows the database moderation setting; owners cannot grant VIP or self-approve pending listings.
- Conversation updates preserve the complete historical message prefix and sender role. Transactional appends avoid overwriting concurrent messages; the UI waits for persistence and retains failed text.
- Mobile chat can return to the conversation list; desktop now has the same navigation dock including profile/login.
- Removed the feed's 300-document ceiling; public and owner/admin data use separate queries. Only 40 search results render initially, with a show-more action. Deep links fetch by document ID.
- Removed persistent listing/conversation caches and automatic demo seeding on an empty feed.
- Storage errors no longer silently embed base64 in Firestore. Failed submissions clean up uploaded objects. Listing deletion cleans up associated objects in the same listing directory; owner delete permissions are enabled.
- Duplicate secondary price display corrected, fixed conversion explicitly labelled indicative, misleading catalogue/safety/online claims reduced.
- Payment client payload/auth matches the server contract. Checkout returns 503 until verified provider callbacks are implemented; no money is collected by this branch.
- Local Express endpoints use the same authenticated handlers as Vercel.
- API responses excluded from service-worker caching; canonical metadata points to the current production origin.
- Added lockfile, npm ci, Java 21 and Firestore rule regression tests to CI.

## Validation

- TypeScript check and production build pass.
- Six Firestore emulator tests pass: moderation, private listing reads, owner/VIP limits, immutable chat history, outsider access, anonymous creation.
- Live two-account chat, real payments, Storage emulator and mobile browser verification are still outstanding.

## Deployment considerations

Review and deploy the frontend and Firebase rules together. The old frontend's unrestricted feed query is incompatible with the new private-read rules. Storage cleanup requires the new Storage delete rule. Existing private listing copies already downloaded by clients cannot be revoked by new rules.

No existing data was migrated or deleted. Legacy records without an active status are no longer publicly listed. Review those records explicitly before activating any.

## Remaining work

- Dedicated indexed server search/pagination for a large catalogue. The current full-readable-catalogue listener fixes correctness, but read costs still grow with catalogue size.
- Verified Click/Payme callbacks, merchant configuration and end-to-end payment testing.
- Per-listing server-rendered SEO metadata, live exchange rates, bundle splitting and Lighthouse/mobile measurements.
- Durable server-side cleanup/retry for interrupted uploads/deletions; current cleanup runs in the authenticated client.
- Persistent per-user AI quotas (the existing in-memory limiter is not a distributed quota).
