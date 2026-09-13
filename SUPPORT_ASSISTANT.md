# Support assistant

Public text-only support at /api/support-chat, using the existing server-only GEMINI_API_KEY. Optional GEMINI_SUPPORT_MODEL defaults to gemini-2.5-flash-lite. No key or provider error details are returned to browsers. There are no account/database tools or staff escalation actions.

The UI explains that questions go to Google Gemini and asks users not to include credentials or payment details. Conversation exists only in component memory, is clearable and is not written to browser storage or a database by this application. Provider retention is governed by the configured Gemini account terms. User messages render as plain text.

Request limits: 10 messages at most, 2,000 chars each, 12,000 total serialized chars, 500 output tokens and a 20-second provider timeout. Client sends the latest seven messages trimmed to 1,200 chars. Per-IP throttle is 10 requests/minute **per running server instance**; it is not a distributed billing cap. Configure provider quotas / a shared limiter before scaling public traffic. Updating the knowledge prompt is required when moderation, payments or support processes change.

Tests: node --import tsx --test tests/support-chat.test.mjs (CI). Covers validation, method/origin checks, missing configuration, provider payload, thought filtering, failures and throttling. Manual live verification should confirm a real answer, panel close/reopen, and help-center navigation.
