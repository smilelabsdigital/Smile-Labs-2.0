# Smile Labs Digital v1.0.3

- One guest preview per browser token (no registration). Browser reset can bypass guest enforcement; do not expose widely without stronger controls.
- Dental professionals get 10 lifetime previews after email verification and entering a GDC number; generation is no longer blocked before admin approval.
- Administrator manually confirms GDC number using official register, unlocking 20 additional lifetime previews (total 30). Revocation restores the 10-preview ceiling without wiping usage.
- Verified users whose email matches server-side ADMIN_EMAIL (or ADMIN_TEST_EMAIL) receive unlimited preview generation. Admin dashboard password alone does not grant studio unlimited use.
- Admin dashboard displays professional details and recent successful generation activity; existing notification email remains operational for each success.
- Responsive desktop and mobile layout refinements for workspace, treatment cards and results.
- Existing Neon accounts and recorded usage are retained. Monthly resets removed.
- No changes to treatment prompts or AI generation integration.
