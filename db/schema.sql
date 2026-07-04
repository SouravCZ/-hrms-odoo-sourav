-- Run this once against your local postgres db:
-- psql -U username -d hrms_db -f db/schema.sql

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(5) NOT NULL,           -- e.g. 'OI' for Odoo India
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  employee_code VARCHAR(30) UNIQUE,   -- e.g. OIJODO20260001, NULL only briefly during company signup
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','hr','employee')),
  department VARCHAR(60),
  job_title VARCHAR(60),
  manager_id INTEGER REFERENCES users(id),
  joining_date DATE DEFAULT CURRENT_DATE,
  profile_pic_url TEXT,
  about TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  force_password_change BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  work_hours NUMERIC(5,2) DEFAULT 0,
  extra_hours NUMERIC(5,2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'absent'
    CHECK (status IN ('present','absent','leave','half_day')),
  UNIQUE(user_id, date)
);

CREATE TABLE leave_balances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('paid','sick','unpaid')),
  allocated NUMERIC(5,1) DEFAULT 0,
  used NUMERIC(5,1) DEFAULT 0,
  year INTEGER NOT NULL,
  UNIQUE(user_id, leave_type, year)
);

CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('paid','sick','unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days NUMERIC(5,1) NOT NULL,
  remarks TEXT,
  attachment_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE salary (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  month_wage NUMERIC(10,2) DEFAULT 0,
  basic_pct NUMERIC(5,2) DEFAULT 50,
  hra_pct NUMERIC(5,2) DEFAULT 50,     -- % of basic
  standard_allowance NUMERIC(10,2) DEFAULT 0,
  performance_bonus NUMERIC(10,2) DEFAULT 0,
  leave_travel_allowance NUMERIC(10,2) DEFAULT 0,
  fixed_allowance NUMERIC(10,2) DEFAULT 0,
  pf_employee_pct NUMERIC(5,2) DEFAULT 12,
  pf_employer_pct NUMERIC(5,2) DEFAULT 13.75,
  professional_tax NUMERIC(10,2) DEFAULT 200,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Helpful index for the "employees list with today's attendance" query
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);

-- Migration: add resume fields to users (run if table already exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS about TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
