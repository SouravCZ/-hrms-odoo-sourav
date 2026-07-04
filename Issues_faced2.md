# Issues & Suggestions - Phase 2

## Priority 1 - Security Fixes

- **Initial password is employee code (guessable)** - Employee code is visible on ID cards, emails, etc. Anyone who knows the naming pattern can guess it.
  - Suggestion: Generate a random strong temporary password (e.g., `Ab3$xK9m`) and send it via email/SMS separately.

- **No rate limiting on login** - Brute force attacks are possible since there's no limit on login attempts.
  - Suggestion: Add `express-rate-limit` (e.g., 5 attempts/min per IP).

- **No password complexity check** - Only minimum 8 characters is enforced on password change.
  - Suggestion: Require uppercase + number + special character in password change.

- **No JWT refresh mechanism** - Token expires in 12h, then user must re-login completely.
  - Suggestion: Add refresh token rotation for seamless session.

## Priority 2 - Better UX

- **First login experience is awkward** - Force password change is just a popup, feels disconnected.
  - Suggestion: Dedicated "Set New Password" screen before dashboard access on first login.

- **Password visibility** - Employee code is shared verbally or written down, which is insecure.
  - Suggestion: Show password once on creation screen only, then hide it permanently.

- **No email notification on employee creation** - Admin creates employee but there's no way to notify them.
  - Suggestion: Send welcome email with credentials when employee is created.


