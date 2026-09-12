# OldiSotti — AI Project Context

This file is the persistent technical context for AI-assisted development of OldiSotti. Before changing code, read this file and then inspect the latest relevant files on `main`. Do not rely on old chat snippets when the repository can be checked directly.

## Source of truth

- Repository: `fedyaibragimovich-gif/OldiSotti`
- Primary branch: `main`
- Production: `https://fedyaibragimovich-gif.vercel.app/`
- Vercel project ID: `prj_sOoHAfLuyDdS9Gwu1YRIEW9Rgq6p`
- Vercel team ID: `team_at6XAe9SMbvlLWVljgZ4wpq2`
- Firebase project ID: `fir-applet-193ca`
- Firestore database ID: `ai-studio-f9bbd8c5-5f87-4e65-89ef-d7e348399a4a`

## Product

OldiSotti is an Uzbekistan classifieds marketplace. Default language is Uzbek, with Russian and Uzbek Cyrillic support. Currency supports UZS/USD. The UI is mobile-first, minimalist, supports dark mode, categories/subcategories, popular brands, search, filters, favorites, recently viewed listings, user auth, chat, personal listings, moderation/admin, Telegram posting, AI image generation, map location, nearby sorting, and payment-preparation flows.

## Important development rules

1. Always inspect the latest repository version before editing.
2. Treat GitHub `main` as the source of truth.
3. Never restore old snippets over newer code without comparing the latest file.
4. Every meaningful change should be committed with a clear commit message.
5. Confirm CI and Vercel deployment status before saying a fix is live.
6. Do not say Firebase Security Rules are live unless their deployment was actually confirmed.
7. Never ask users to paste secrets into chat. Secrets belong in Vercel/GitHub/Firebase environment configuration.
8. Never grant VIP/TOP from the browser. Promotion must come from a verified server-side payment flow.
9. The project uses `"type": "module"`; local imports in Vercel serverless API files must use `.js` where Node ESM requires it.
10. Some production hardening is injected by prebuild scripts. Before directly editing behavior in `src/App.tsx` or `PostAdModal.tsx`, inspect the prebuild scripts to avoid conflicts.

## Build and CI

`package.json` important scripts:

- `prebuild`: `node scripts/remove-ai.mjs && node scripts/require-auth.mjs && node scripts/harden-app.mjs && node scripts/location-map.mjs`
- `build`: Vite build plus bundled Node server
- `lint`: `tsc --noEmit`

GitHub CI uses Node 22 and runs install, lint/typecheck, and production build.

## Authentication

Firebase Auth is in use. Google login was fixed and is known to work. Do not redesign auth unless a new bug is confirmed.

Admin authorization is based on the configured admin UID and verified admin email. Admin controls must never be exposed to ordinary users.

Normal-user rules:

- Posting requires a real authenticated, non-anonymous account.
- Chat requires authentication.
- A user cannot start a chat on their own listing.
- `Mening e'lonlarim` must be filtered by the authenticated Firebase UID.

## Listing creation

`PostAdModal` is the main listing form.

Current expectations:

- At least one image is required.
- Maximum 4 images.
- Current Firestore image payload guard is about 700,000 characters total because images are still stored as data URLs.
- Uploaded-image delete control must be visible on mobile without hover.
- Demo contact-name/phone/Telegram defaults must not be present in production.
- Browser input must not be trusted for `isVip`, `isTop`, `isPostedToTelegram`, or seller verification.
- The listing must be successfully persisted before the UI reports success.
- If moderation is enabled, success text must say the listing was sent for review rather than falsely saying it is already public.

## Map / location

- Mapping uses OpenStreetMap tiles with Leaflet (`leaflet` + `@types/leaflet`).
- Reusable component: `src/components/LocationMap.tsx`.
- `LocationInfo` supports optional `latitude` and `longitude`.
- Posting allows a user to place a pin manually or explicitly request browser geolocation via `navigator.geolocation`.
- Exact street address remains optional; users can place an approximate nearby pin for privacy.
- Listing details show the real map only when coordinates exist; legacy listings without coordinates show a fallback message.
- The listing sort includes `distance` / “Menga yaqin”. Selecting it requests browser location permission and sorts coordinate-enabled listings by Haversine distance. Listings without coordinates fall to the end.
- Browser location is cached only in localStorage under `oldisotti_user_location` for nearby sorting.
- Production wiring for PostAd, ListingDetail, App sorting, and ListingFilters is injected by `scripts/location-map.mjs`; inspect that script before changing related source behavior.

## Listing status behavior

Public marketplace feed should display only `active` listings.

Do not show `pending`, `rejected`, `reserved`, or `sold` listings in the public feed.

The listing owner should still be able to see their own non-active listings in `Mening e'lonlarim`, including moderation state/rejection reason where relevant.

## Firestore write sanitization

Firestore rejects `undefined`, including nested `undefined` values. `src/lib/firebase.ts` contains a recursive `stripUndefinedDeep(...)` helper and listing writes/updates must be sanitized before `setDoc` or `updateDoc`.

This was added to fix cases such as:

`location.address: undefined`

Do not remove this sanitization.

## User-state hygiene

Fresh users must not inherit demo data.

No default fake favorites, recently-viewed entries, or mock chat conversations should be seeded into an ordinary user's state.

## Chat

Conversations are participant-restricted. Buyer/seller sender roles must be derived from the authenticated user and conversation, not hardcoded.

Do not create demo chats for normal users.

## Telegram

Relevant endpoints include:

- `api/telegram/post-listing.ts`
- `api/telegram/test-connection.ts`
- `api/telegram/send-notification.ts`

Telegram publishing uses server-side token configuration.

Rich listing cards support title, price, region/district, condition, delivery, description, image, and an inline button.

Only `active` listings may be posted to Telegram. Pending listings must not be auto-posted before moderation.

Listing links use a query parameter such as:

`/?listing=<listing-id>`

The frontend must support this deep link and open the correct listing. Share links should also point to the specific listing.

Never ask for a Telegram bot token in chat.

## Admin panel

Known important behaviors:

- Listing moderation must persist to Firestore.
- Seller verification persistence may be injected by `scripts/harden-app.mjs`; inspect that script before editing the source handler.
- Avoid optimistic UI that shows success if the Firestore operation failed; persist first or explicitly rollback.
- The same principle applies to approve/reject, delete, seller block/unblock, report status, and other moderation actions.
- Firestore listing writes are sanitized against nested `undefined`.

## Payments

Click and Payme checkout preparation exists, with server-side plan/amount validation and pending payment-order persistence.

Trusted plans are 1, 3, and 7 days; current pricing is 25,000 UZS/day.

The browser must not choose arbitrary payment amounts.

Still incomplete:

- CLICK Prepare/Complete callback and signature verification
- Payme Merchant API transaction methods
- Verified server-side VIP activation
- Full transaction-state handling

Never activate VIP from return URLs or browser redirects.

## Security rules

Firestore rules were hardened in the repository, including listing ownership, privileged flags, chat access, reports, notifications, blocked sellers, settings, and payment orders.

Important: repository rules are not necessarily deployed. Vercel does not deploy Firebase Security Rules.

A GitHub Actions workflow exists for Firebase rules deployment and requires the `FIREBASE_SERVICE_ACCOUNT_JSON` repository secret. Never ask for the service-account JSON in chat.

## Images / storage

Current local uploads are still serialized as data URLs into listing documents. This is a temporary limitation and risks the Firestore 1 MiB document limit.

Long-term priority: migrate listing images to Firebase Storage or another object-storage service, storing only URLs in Firestore.

## Known production-hardening scripts

- `scripts/require-auth.mjs`
  - enforces auth on posting
  - strips demo contact defaults
  - limits image count/payload
  - disables direct browser VIP
  - ensures seller verification is not client-trusted
  - keeps mobile image-delete control accessible

- `scripts/harden-app.mjs`
  - tracks authenticated user
  - restricts My Ads to current UID
  - prevents self-chat / unauthenticated chat
  - sets correct sender role
  - admin-only moderation subscriptions
  - blocks direct VIP upgrade
  - may persist seller verification
  - removes demo user state
  - hardens listing publication flow
  - supports listing deep links / active-only public visibility

- `scripts/location-map.mjs`
  - wires the Leaflet picker into posting
  - persists optional latitude/longitude in listing location
  - replaces the old mock map in listing details with the real map
  - adds browser-location-based “Menga yaqin” sorting

When changing source code, verify the prebuild scripts do not overwrite or re-patch the same behavior.

## Recent important fixes

- Firestore nested-`undefined` sanitization.
- Mobile-visible image removal in listing form.
- Honest listing-submit flow: save first, then report success.
- Pending/rejected listings visible to the owner, hidden from public feed.
- Demo favorites/recent views/chats removed for fresh users.
- Specific listing deep links for Telegram/share.
- Rich Telegram listing cards.
- Google login flow fixed.
- Moderation report subscription restricted to admins.
- Security headers added in `vercel.json`.
- OpenStreetMap/Leaflet location picker, listing map, and nearby sorting added.

## Before every new task

Use this checklist:

1. Read `AI_CONTEXT.md`.
2. Fetch the latest relevant files from `main`.
3. Inspect prebuild scripts if they touch the same behavior.
4. Make the smallest safe change.
5. Run/verify CI if available.
6. Check the Vercel deployment for the exact commit.
7. Only then say the change is live.

## Maintenance

Update this file whenever architecture, security assumptions, deployment flow, payments, Firebase setup, major features, or known caveats change. Keep it concise enough to remain useful and accurate enough to prevent regressions.
