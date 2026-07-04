CRITICAL — Security
1. salary.js GET/PUT /:userId — No company scoping. Admin of Company A can view/modify Company B's salaries
2. leave.js PATCH /requests/:id — No company scoping. Admin of Company A can approve/reject Company B's leaves
HIGH — Bugs
3. attendance.js — today() uses UTC but nowTime() uses local time. Late-night check-ins get recorded on wrong date
4. leave.js — Year-spanning leaves deduct all days from start year's balance only
5. leave.js GET /requests — No validation on status query param (passes raw input to SQL)
6. employees.js — No validation on department and jobTitle fields
7. salary.js PUT — Most fields have no validation (negative values accepted)
MEDIUM — Missing Checks
8. attendance.js — No date format validation on query params (bad input → 500 error)
9. employees.js — No NaN guard on :id param
10. auth.js — Signup doesn't return a token (admin must login separately)
11. server.js — Wide-open CORS, no origin restriction
LOW — Cleanup
12. generateTempPassword() is exported but never used
13. manager_id column in DB is unused
14. attendance.js — totalWorkingDays label is misleading