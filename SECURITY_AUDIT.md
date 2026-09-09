# OldiSotti Security Audit

## Scope
Audit of the Firebase/Firestore configuration at commit `c911859e0a16927d5e87372248d9da308e7546e6`.

## Critical findings

### 1. Firestore rules allow unrestricted access
The current `firestore.rules` grants public read/write access to conversations, users, moderation reports, and platform settings. Listing updates/deletes are also unrestricted.

This must be replaced before production deployment with authenticated, ownership-based rules and admin-only rules for moderation/platform settings.

### 2. Client-side Firebase configuration is committed
`firebase-applet-config.json` contains the Firebase project configuration. Firebase web API keys are not secret credentials by themselves, but they must be protected by strict Firestore/Storage/Auth rules and appropriate Firebase API restrictions.

## Recommended next step
Implement authenticated access control first, then verify Storage rules, Authentication configuration, listing ownership, chat participant checks, and admin authorization before exposing the application publicly.

## Important
This audit intentionally does not expose credential values. If any server-side secret was ever committed elsewhere in Git history, rotate it immediately.
