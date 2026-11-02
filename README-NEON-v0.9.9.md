# Smile Labs Digital v0.9.9 — Neon account storage

1. Reset exposed Neon password and update Render `DATABASE_URL` with the NEW pooled URL.
2. Upload all extracted files to the root of GitHub, keeping the `public/` folder. Never upload `.env` or `private-data`.
3. Render build: `npm install`; start: `npm start`; use `NODE_ENV=production`, `COOKIE_SECURE=true` and the same stable `SESSION_SECRET` across redeployments.
4. Check logs for `Initialised durable Neon account storage` or `Loaded accounts and usage from Neon`.
5. Test a new dentist account with email codes, guest access, and redeploy persistence with non-patient test images.

Changes: Uses Neon Postgres JSONB storage for the existing account model; retains email-code login, approval, guest credits and counts across restarts; 30-day signed sessions; safely starts a new guest when an obsolete token is found. Frontend and AI prompts untouched.

Limitations: single-instance JSONB persistence is intended for this prototype and is not concurrency-safe across multiple Render instances; must be redesigned for multi-instance production usage. Previous accounts stored on Render ephemeral disk cannot be recovered automatically. Existing users might need to register once. Guest allowances are cookie-based and can be bypassed by clearing cookies or using a different browser. Do not use real patient data without proper security, privacy, retention and vendor assessments. Live database and full AI integration tests were not possible in this environment. The Node `pg` dependency is downloaded by Render during `npm install`.
