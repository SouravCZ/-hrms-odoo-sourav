<div align="center">

# HRMS — Human Resource Management System

**Every workday, perfectly aligned.**

Built for the Odoo x Adamas University Hackathon '26

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![Node](https://img.shields.io/badge/Node.js-Express_4-339933?logo=node.js&logoColor=white&style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square)
![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens&style=flat-square)

[Demo Video](https://drive.google.com/file/d/1fw9xdHg_EUNv9nqe5fWnCnmLphWWB9b4/view) · [Workflow Diagram](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh) · [Setup](#setup--installation)

</div>

---

## What This Is

A full-stack HRMS covering the actual lifecycle of an employee at a company: onboarding, daily attendance, leave requests, and salary — with role-based access split across Admin, HR, and Employee. Built with React on the frontend and Express + PostgreSQL on the backend, no BaaS platforms, no third-party auth providers, just a real database and a real API.

## Demo

**Watch the full walkthrough here: [Demo Video](https://drive.google.com/file/d/1fw9xdHg_EUNv9nqe5fWnCnmLphWWB9b4/view)**

The video covers the complete flow end to end — company signup, employee creation, first login and forced password change, check-in/check-out, a leave request going through approval, and the salary breakdown view.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Vite 5, Axios, Lucide React, react-hot-toast |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (via `pg`) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| File Uploads | Multer |
| Email | Nodemailer (SMTP via Gmail) |
| Styling | Vanilla CSS with CSS custom properties — no framework, no gradients, no AI-template look |

---

## Folder Structure

```
hrms-odoo-sourav/
├── .env                          # Backend environment variables
├── .env.example                  # Template for .env
├── package.json                  # Backend dependencies
├── index.html                    # Serves frontend in production
│
├── db/
│   └── schema.sql                # PostgreSQL schema (6 tables + migrations)
│
├── uploads/                      # Uploaded attachment files (leave requests)
│
├── src/                          # ---- BACKEND (Express) ----
│   ├── server.js                 # Entry point, middleware, route mounting, auto-migration
│   ├── db.js                     # PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js               # requireAuth, requireRole (JWT verification)
│   │   └── upload.js             # Multer config for file uploads
│   ├── routes/
│   │   ├── auth.js               # Sign up, login, change password
│   │   ├── employees.js          # CRUD employees, resume self-update
│   │   ├── attendance.js         # Check-in, check-out, day/month queries
│   │   ├── leave.js              # Leave balances, requests, approve/reject
│   │   └── salary.js             # Get/set salary breakdown
│   ├── services/
│   │   └── emailService.js       # Nodemailer (welcome + password reset emails)
│   └── utils/
│       ├── idGenerator.js        # Employee code generator (e.g. OIJODO20260001)
│       └── passwordGenerator.js  # Crypto-based password gen + validation
│
└── frontend/                     # ---- FRONTEND (React + Vite) ----
    ├── .env                      # VITE_API_URL=http://localhost:5000
    ├── package.json              # Frontend dependencies
    ├── vite.config.js            # Vite config (port 3000)
    ├── index.html                # HTML entry point
    │
    └── src/
        ├── main.jsx              # ReactDOM + BrowserRouter + AuthProvider + Toaster
        ├── App.jsx               # Route definitions with role-based redirects
        ├── index.css             # Global styles (CSS custom properties)
        │
        ├── context/
        │   └── AuthContext.jsx   # Auth state, signIn/signOut, localStorage persistence
        ├── hooks/
        │   └── useAuth.js        # useContext(AuthContext) hook
        ├── services/
        │   └── api.js            # Axios instance + all API call functions
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx           # Top nav: tabs, check-in/out button, avatar dropdown
        │   │   └── ProtectedRoute.jsx   # Auth guard + Navbar wrapper
        │   ├── ui/
        │   │   ├── Avatar.jsx           # Initials avatar + status dot
        │   │   ├── Button.jsx           # Reusable button (primary/outline/approve/reject)
        │   │   ├── Card.jsx             # Generic card wrapper
        │   │   ├── Input.jsx            # Labelled input field
        │   │   ├── Modal.jsx            # Overlay modal with header/footer
        │   │   ├── StatusDot.jsx        # Color dot (present/absent/leave/working/checked-out)
        │   │   └── StatusPill.jsx       # Status badge (approved/pending/rejected)
        │   ├── attendance/
        │   │   └── AttendanceTable.jsx  # Shared table (admin: employee names, employee: dates)
        │   ├── employees/
        │   │   ├── EmployeeCard.jsx     # Card with avatar, info, attendance status badge
        │   │   ├── EditEmployeeModal.jsx    # Admin edit employee details
        │   │   └── SalaryFormModal.jsx      # Admin set/edit salary
        │   ├── profile/
        │   │   ├── ProfileTabs.jsx      # Tab navigation (Resume / Private Info / Salary Info)
        │   │   ├── ResumeTab.jsx        # Editable skills + certifications
        │   │   ├── PrivateInfoTab.jsx   # Employee ID, email, phone, dept, etc.
        │   │   └── SalaryInfoTab.jsx    # Earnings + deductions breakdown table
        │   └── timeoff/
        │       ├── BalanceCard.jsx       # Days available card
        │       ├── TimeOffTable.jsx      # Leave requests table with attachment links
        │       └── TimeOffRequestModal.jsx  # Submit new leave request form
        │
        └── pages/
            ├── auth/
            │   ├── SignIn.jsx            # Login page
            │   ├── SignUp.jsx            # Company + admin signup
            │   └── ChangePassword.jsx    # First-login forced password change
            ├── employees/
            │   ├── Dashboard.jsx         # Employee card grid (admin/HR only)
            │   └── AddEmployee.jsx       # Admin form to create employee
            ├── profile/
            │   └── Profile.jsx           # Full profile with tabs + admin edit/salary modals
            ├── attendance/
            │   ├── AdminView.jsx         # Single-day attendance for all employees
            │   └── EmployeeView.jsx      # Monthly attendance + summary stats
            └── timeoff/
                ├── AdminView.jsx         # All leave requests queue (approve/reject)
                └── EmployeeView.jsx      # Own leave balances + request history
```

---

## Features

### Authentication & Roles
- Company signup creates the first admin account
- Login via employee code or email + password, JWT-based
- Forced password change on first login
- Three roles — admin, hr, employee — with route-level access control

### Employee Management (Admin/HR)
- Employee card grid with search
- Add employee: auto-generates employee code + temp password, sends a welcome email
- Edit employee details (name, email, phone, department, job title, joining date)
- Set or edit an employee's salary structure

### Employee Dashboard
- Employees land on their own profile and can't browse other employees
- Admin/HR see the full card grid

### Profile
- **Private Info** — employee ID, email, phone, department, job title, joining date
- **Resume** — editable about section, skills as add/remove pills, certifications with links
- **Salary Info** — earnings (basic, HRA, allowances) and deductions (PF, professional tax) with amounts and percentages
- Avatar carries a live attendance status dot

### Attendance
- Check-in/check-out button lives in the navbar:
  - Red — not checked in
  - Green — checked in
  - Purple — checked out for the day
- Admin view: day-by-day, all employees' check-in/out times
- Employee view: own month, with days-present / leaves / total-working-days summary

### Time Off
- Employee: view paid/sick balances, submit a request with an optional attachment, see request history
- Admin/HR: view all requests, approve or reject
- Attachments show up as clickable links in the request table

### Salary Management
- Admin sets monthly wage, Basic %, HRA %, Standard Allowance, Performance Bonus, Leave Travel Allowance, Fixed Allowance, PF Employee %, PF Employer %, Professional Tax
- Breakdown displayed in ₹ and as a percentage of monthly wage

### Notifications
- react-hot-toast handles all success/error feedback — no browser alerts

---

## Database Schema

```
companies ──< users ──< attendance
                   ├──< leave_balances
                   ├──< leave_requests
                   └─── salary (1:1)
```

| Table | Purpose |
|---|---|
| `companies` | Company info — name, code, logo |
| `users` | All users (admin/hr/employee), profile data, skills, certifications |
| `attendance` | Daily check-in/check-out records with computed work hours |
| `leave_balances` | Annual leave allocation per type (paid/sick/unpaid) |
| `leave_requests` | Leave requests with status flow — pending → approved/rejected |
| `salary` | Percentage-based salary structure per employee |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/signup-company` | Create company + admin account | Public |
| POST | `/login` | Login (employee code or email) | Public |
| POST | `/change-password` | Update password, forced on first login | Required |

### Employees — `/api/employees`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | List employees with today's attendance status | Required |
| POST | `/` | Create employee | Admin/HR |
| GET | `/:id` | Get employee profile (skills, certifications included) | Required |
| PUT | `/:id` | Update employee details | Admin/HR |
| PUT | `/:id/resume` | Update own skills/certifications/about | Self |

### Attendance — `/api/attendance`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/check-in` | Check in | Self |
| POST | `/check-out` | Check out, computes work hours | Self |
| GET | `/me/today` | Own today's attendance | Self |
| GET | `/day?date=YYYY-MM-DD` | All employees for a given day | Admin/HR |
| GET | `/me/month?month=YYYY-MM` | Own month + summary | Self |

### Leave / Time Off — `/api/leave`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/balances` | Own leave balances | Self |
| POST | `/requests` | Submit request (multipart, optional attachment) | Self |
| GET | `/requests/me` | Own request history | Self |
| GET | `/requests?status=pending` | All requests, filterable | Admin/HR |
| PATCH | `/requests/:id` | Approve or reject | Admin/HR |

### Salary — `/api/salary`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/:userId` | Salary breakdown | Self/Admin |
| PUT | `/:userId` | Set or update salary structure | Admin |

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### 1. Clone
```bash
git clone https://github.com/SouravCZ/hrms-odoo-sourav.git
cd hrms-odoo-sourav
```

### 2. Set up the database
```bash
psql -U postgres -c "CREATE DATABASE hrms_db;"
psql -U postgres -d hrms_db -f db/schema.sql
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

```
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hrms_db
JWT_SECRET=your-secret-key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

### 4. Install dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 5. Run
```bash
# Terminal 1 — backend on port 5000
npm run dev

# Terminal 2 — frontend on port 3000
cd frontend && npm run dev
```

App runs at `http://localhost:3000`.

---

## Project Workflow

See the full diagram: [Excalidraw Workflow](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

1. **Company registration** — admin signs up with company details
2. **Employee onboarding** — admin creates the employee, system generates credentials and sends a welcome email
3. **First login** — employee logs in with the temp password, forced to set a new one
4. **Daily attendance** — check in/out from the navbar, work hours computed automatically
5. **Leave management** — employee submits a request with an optional attachment, admin approves or rejects
6. **Salary management** — admin sets a percentage-based salary structure, system computes the breakdown
7. **Profile management** — employee updates skills and certifications, admin edits core details

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret for JWT signing | — |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | — |
| `SMTP_PASS` | SMTP app password | — |
| `EMAIL_FROM` | Sender email address | — |
| `FRONTEND_URL` | Frontend origin (CORS + email links) | `http://localhost:3000` |
| `VITE_API_URL` | Backend API URL (frontend `.env`) | `http://localhost:5000` |

---

<div align="center">

Built for the **Odoo x Adamas University Hackathon '26**

</div>
