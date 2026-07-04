# HRMS - Human Resource Management System

A full-stack HRMS web application built with **React** (frontend) and **Express.js** (backend) with **PostgreSQL** for database storage. The system supports role-based access for **Admin**, **HR**, and **Employee** users, covering employee management, attendance tracking, leave requests, and salary management.

> **Workflow Diagram:** [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, Vite 5, Axios, Lucide React (icons), react-hot-toast |
| **Backend** | Node.js, Express 4 |
| **Database** | PostgreSQL (via `pg` driver) |
| **Authentication** | JWT (jsonwebtoken) + bcrypt password hashing |
| **File Uploads** | Multer |
| **Email** | Nodemailer (SMTP via Gmail) |
| **Styling** | Vanilla CSS with CSS Custom Properties |

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
- **Company signup** creates an admin account
- **Login** via employee code or email + password (JWT-based)
- **Forced password change** on first login
- Three roles: `admin`, `hr`, `employee` with role-based route protection

### Employee Management (Admin/HR)
- Employee card grid with search filtering
- Add new employee (auto-generates employee code + temp password, sends welcome email)
- Edit employee details (name, email, phone, department, job title, joining date)
- Set/edit employee salary structure

### Employee Dashboard
- Regular employees are redirected to their own profile (cannot see other employees)
- Admin/HR see the full employee card grid

### Profile
- **Private Info tab**: Employee ID, email, phone, department, job title, joining date
- **Resume tab**: Editable about, skills (add/remove pills), certifications (name + link)
- **Salary Info tab**: Earnings (basic, HRA, allowances) + deductions (PF, professional tax) with percentages
- Avatar with attendance status dot

### Attendance
- **Check-in/Check-out** button in navbar for employees:
  - Red = not checked in
  - Green = checked in (working)
  - Purple = checked out (done for the day)
- **Admin view**: Day-by-day navigation showing all employees' check-in/out times
- **Employee view**: Monthly attendance with summary stats (days present, leaves, total working days)

### Time Off / Leave Management
- **Employee**: View leave balances (paid, sick), submit leave requests with optional attachment (PDF/image), view request history
- **Admin/HR**: View all leave requests, approve or reject pending requests
- Attachments are viewable as clickable links in the request table

### Salary Management
- **Admin can set salary** for any employee with:
  - Monthly wage, Basic %, HRA %, Standard Allowance, Performance Bonus, Leave Travel Allowance, Fixed Allowance, PF Employee %, PF Employer %, Professional Tax
- **Salary breakdown** displayed with amounts in INR and percentage of monthly wage

### Toast Notifications
- react-hot-toast for all success/error feedback (replaces alerts and inline messages)

---

## Database Schema

6 tables with the following relationships:

```
companies ──< users ──< attendance
                   ├──< leave_balances
                   ├──< leave_requests
                   └─── salary (1:1)
```

| Table | Purpose |
|-------|---------|
| `companies` | Company info (name, code, logo) |
| `users` | All users (admin/hr/employee) with profile data, skills, certifications |
| `attendance` | Daily check-in/check-out records with work hours |
| `leave_balances` | Annual leave allocations per type (paid/sick/unpaid) |
| `leave_requests` | Leave requests with status workflow (pending -> approved/rejected) |
| `salary` | Percentage-based salary structure per employee |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/signup-company` | Create company + admin account | Public |
| POST | `/login` | Login (employee code or email) | Public |
| POST | `/change-password` | Update password (forced on first login) | Required |

### Employees (`/api/employees`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all employees with today's attendance status | Required |
| POST | `/` | Create new employee (admin/HR only) | Admin/HR |
| GET | `/:id` | Get employee profile (includes skills, certifications) | Required |
| PUT | `/:id` | Update employee details (admin/HR only) | Admin/HR |
| PUT | `/:id/resume` | Update own skills/certifications/about | Self |

### Attendance (`/api/attendance`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/check-in` | Check in (current time) | Self |
| POST | `/check-out` | Check out (calculates work hours) | Self |
| GET | `/me/today` | Get own today's attendance | Self |
| GET | `/day?date=YYYY-MM-DD` | Get all employees' attendance for a day | Admin/HR |
| GET | `/me/month?month=YYYY-MM` | Get own monthly attendance + summary | Self |

### Leave / Time Off (`/api/leave`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/balances` | Get own leave balances | Self |
| POST | `/requests` | Submit leave request (multipart with attachment) | Self |
| GET | `/requests/me` | Get own leave request history | Self |
| GET | `/requests?status=pending` | Get all leave requests (filterable) | Admin/HR |
| PATCH | `/requests/:id` | Approve or reject a leave request | Admin/HR |

### Salary (`/api/salary`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:userId` | Get salary breakdown (self or admin viewing any) | Self/Admin |
| PUT | `/:userId` | Set/update salary structure | Admin |

---

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/SouravCZ/hrms-odoo-sourav.git
cd hrms-odoo-sourav
```

### 2. Set up the database
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE hrms_db;"

# Run the schema
psql -U postgres -d hrms_db -f db/schema.sql
```

### 3. Configure environment variables
```bash
# Copy the example and edit with your values
cp .env.example .env
```

Required variables in `.env`:
```
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hrms_db
JWT_SECRET=your-secret-key

# SMTP (for welcome emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

### 4. Install dependencies
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

### 5. Start the application
```bash
# Start backend (port 5000)
npm run dev

# In a separate terminal, start frontend (port 3000)
cd frontend
npm run dev
```

The app is now running at `http://localhost:3000`.

---

## Project Workflow

![Workflow Diagram](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

The workflow covers the complete employee lifecycle:

1. **Company Registration** -> Admin signs up with company details
2. **Employee Onboarding** -> Admin creates employee, system generates credentials, sends welcome email
3. **First Login** -> Employee logs in with temp password, forced to set new password
4. **Daily Attendance** -> Employee checks in/out via navbar button, system tracks work hours
5. **Leave Management** -> Employee submits request (with optional attachment), admin approves/rejects
6. **Salary Management** -> Admin sets percentage-based salary structure, system computes breakdown
7. **Profile Management** -> Employee updates skills and certifications, admin edits details

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for JWT token signing | - |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username/email | - |
| `SMTP_PASS` | SMTP password (app password for Gmail) | - |
| `EMAIL_FROM` | Sender email address | - |
| `FRONTEND_URL` | Frontend origin URL (for CORS + emails) | `http://localhost:3000` |
| `VITE_API_URL` | Backend API URL (frontend .env) | `http://localhost:5000` |

---

## License

This project was built as part of the **Odoo Hackathon** initiative.
