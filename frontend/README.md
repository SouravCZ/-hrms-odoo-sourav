# HRMS Frontend (React + Vite)

## Setup

```bash
cd frontend
npm install
```

Add your logo at `src/assets/logo.png` (a placeholder note is sitting in that folder — delete it once the real logo is in). The Navbar and auth pages currently show a plain icon in place of a logo; swap in `<img src={logo} />` once you've added the file, if you want the real image instead of the placeholder icon.

`.env` is already set to point at the local backend:
```
VITE_API_URL=http://localhost:5000
```
Change this if your backend runs on a different port.

## Run

Make sure the backend (Ankan's Express server) is running first on port 5000, then:

```bash
npm run dev
```

Opens on `http://localhost:3000`.

## First-time flow to test

1. Go to `/signup`, create the company + admin account
2. Sign in with that admin account
3. From Employees dashboard, click "Add Employee" — copy the returned Login ID + temp password
4. Log out, sign in as that new employee using the temp password
5. You'll be forced to `/change-password` — set a real password
6. From there: check in/out on your profile, submit a Time Off request, and (as admin) approve/reject it from the Time Off tab

## Structure

```
src/
  main.jsx, App.jsx        — entry point + routes
  index.css                 — the whole design system (colors, buttons, cards, tables, etc.)
  context/AuthContext.jsx   — logged-in user + token
  services/api.js           — every backend call lives here, one function per endpoint
  components/               — reusable pieces (buttons, cards, tables, modal, navbar...)
  pages/                     — one file per actual screen
```

If a backend endpoint's request/response shape changes, `services/api.js` is the only file that needs updating — pages call functions from there, not raw fetch/axios calls directly.
