# Smile Labs Digital v0.8.1 — Minimal Premium Reference Design

Based on v0.8.0, with original `server.js` preserved byte-for-byte.

Changes: refined hero, sign-in, photo/upload cards, treatment cards, simulated shade preview thumbnails, comparison panels, and responsive styling in `public/premium-final.css`. Kept registration, dentist fields, admin test account, OpenAI prompt routing, preview and slider DOM hooks. Fixed sign-in heading remaining visible after authentication and original generation button label after loading.

Run `npm install`, `npm test`, `npm start`. Copy your existing `.env` and `private-data` from the prior version locally; do not commit either to GitHub.

**Test coverage:** Node.js syntax and project prompt tests run; no end-to-end browser or live OpenAI/email test could be completed in this environment. Deploy only after testing on desktop/mobile, dental registration, verification, AI generation and usage limits. No changes to underlying local JSON account persistence on Render; production database still needed.
