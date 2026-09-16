# OldiSotdi security status

Last reviewed: 16 September 2026.

## Historical note

The original version of this document described an older commit where Firestore access was overly permissive. Those critical rules have since been replaced. Do not use the old finding as a description of the current `main` branch.

## Current controls

- Public users can read active listings; owners can read their own listings; admin access is explicitly gated.
- New listings require an authenticated non-anonymous user, validated ownership/content, safe initial status, and cannot self-grant VIP/TOP/verification flags.
- Owner listing updates are field-limited; view increments are constrained to +1 on active listings.
- Conversations are limited to participants/admin, with sender, unread-counter and message-shape validation.
- Moderation reports are created by authenticated users and readable/updatable only by admin.
- Notifications are scoped to the recipient, with constrained message-notification creation and read-state updates.
- Blocked-seller documents are scoped to the owning user.
- Storage uploads are owner-only, limited to JPEG/PNG/WebP images up to 10 MB; public listing images are readable and deletion is owner/admin controlled.
- Firebase web configuration is client configuration, not a server secret. Security depends on Firestore/Storage/Auth rules and provider/API configuration.
- Production responses include HSTS, `nosniff`, frame/referrer protections, COOP compatible with Google sign-in popups, and a restrictive Permissions Policy.

## Remaining launch checks

The following cannot be proven from repository source alone and must be verified on the live Firebase/Vercel configuration before a broad public announcement:

1. Firebase Authentication Authorized Domains includes every production/custom domain actually used.
2. Email/password, Google popup login and password-reset flows work on the final production domain.
3. A real user can upload allowed images and cannot write another user's Storage path.
4. Firestore and Storage rules deployed in the Firebase project match the tested repository rules.
5. No server-side credential or bot token is present in client-delivered bundles or committed source.

See `PRODUCTION_READINESS_2026_09_16.md` for the final release gate. Payment integration and the support assistant are outside this audit pass.
