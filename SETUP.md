# HRMS Backend — Setup (do this now, ~10 min)

## Whoever pulls this in first (probably Sourav, on `main`)

```bash
cd your-repo-folder
# copy in all files from this scaffold (package.json, src/, db/, .env.example)

npm install

cp .env.example .env
# edit .env: set DATABASE_URL to your local postgres, and JWT_SECRET to any random string

# create the db (adjust name if you want)
createdb hrms_db

# load schema
psql -U your_pg_user -d hrms_db -f db/schema.sql

# run it
npm run dev   # or: node src/server.js
```

Test it's alive:
```bash
curl http://localhost:5000/api/health
```

Then commit and push this scaffold to `main` immediately so everyone can branch off it:
```bash
git add .
git commit -m "Initial backend scaffold: auth, employee creation, DB schema"
git push origin main
```

## Everyone else — pull main, then branch

```bash
git pull origin main
npm install
cp .env.example .env   # same DB, your own JWT_SECRET is fine
git checkout -b feature/<your-module>   # e.g. feature/attendance, feature/leave, feature/profile
```

## Test the auth flow first (do this before building anything else)

```bash
# 1. Create the company + admin account
curl -X POST http://localhost:5000/api/auth/signup-company \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Odoo India","adminName":"Sourav Chakraborty","email":"admin@test.com","password":"admin1234"}'

# 2. Log in as admin (use the employee_code returned above, or the email)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@test.com","password":"admin1234"}'
# copy the token from the response

# 3. Create an employee (use the token from step 2)
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_HERE>" \
  -d '{"firstName":"Agniva","lastName":"Chatterjee","email":"agniva@test.com","department":"Engineering","jobTitle":"Developer"}'
# response includes employee_code + tempPassword — that's what the employee logs in with

# 4. Log in as that employee using the returned employee_code + tempPassword
```

If all 4 steps work, the core auth chain is solid and everyone can build their module against real login on top of it.

## What's already built
- Company/admin signup
- Login (by employee_code or email) with JWT
- Forced password change flow (`force_password_change` flag + `/api/auth/change-password`)
- Employee creation with auto-generated ID (`OIJODO20260001` style) + temp password
- Employees list endpoint (feeds the card-grid page, includes today's live attendance status)
- Employee profile endpoint (view-only, salary only returned for self/admin/hr)
- DB schema for attendance, leave balances/requests, salary

## What's NOT built yet — pick your module
- Attendance check-in/check-out endpoints + admin day view + employee month view
- Leave request creation + approve/reject + balance deduction
- Salary CRUD (admin edit, employee read-only)
- Frontend — everything above is just the API right now

## Git reminders (this is scored — don't skip)
- Work on your own branch, commit often with real messages
- Merge into `main` at checkpoints, not all at once at 4:45 PM
- Use `git merge feature/xyz --no-ff` to keep everyone's commit history visible
