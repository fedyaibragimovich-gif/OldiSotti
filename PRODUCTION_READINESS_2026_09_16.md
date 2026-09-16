# OldiSotdi production readiness — 16 September 2026

This document tracks the final public-launch hardening pass. Payment integration and the support assistant are intentionally excluded from this launch gate.

## Launch gate

- No demo/sample fallback may be presented as real marketplace inventory when Firestore is empty or unavailable.
- Public listing URLs and metadata must use OldiSotdi-branded IDs.
- Legacy browser-storage keys must migrate without losing user preferences/favorites.
- SEO metadata regressions must run in CI.
- Production security headers, PWA cache behavior, Firestore/Storage rules and TypeScript/build checks must remain green.
- Public production deployment must return healthy responses with no 5xx runtime-error cluster.

## Live verification still required outside source-level CI

Before a broad public announcement, perform one real-device pass for Google/email login, password reset, posting a listing with images, and two-account chat on the production domain. Firebase Authorized Domains/custom-domain DNS are console settings and cannot be proven by source inspection alone.
