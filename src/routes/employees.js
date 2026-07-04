const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { generateEmployeeCode } = require('../utils/idGenerator');
const { generatePassword } = require('../utils/passwordGenerator');
const { sendWelcomeEmail } = require('../services/emailService');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/employees  (Admin/HR only)
// Creates a new employee, auto-generating their login ID and temp password.
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'hr'),
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('joiningDate').optional().isISO8601(),
    body('department').optional().trim().isLength({ max: 100 }),
    body('jobTitle').optional().trim().isLength({ max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { firstName, lastName, email, phone, department, jobTitle, joiningDate } = req.body;

    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length) return res.status(409).json({ error: 'Email already in use' });

      const companyRes = await pool.query('SELECT code FROM companies WHERE id = $1', [req.user.companyId]);
      const companyCode = companyRes.rows[0].code;
      const joinDate = joiningDate || new Date().toISOString().slice(0, 10);

      const employeeCode = await generateEmployeeCode(
        req.user.companyId, companyCode, firstName, lastName, joinDate
      );
      const tempPassword = generatePassword(12);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const result = await pool.query(
        `INSERT INTO users
          (company_id, employee_code, first_name, last_name, email, phone,
           password_hash, role, department, job_title, joining_date, force_password_change)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'employee',$8,$9,$10, TRUE)
         RETURNING id, employee_code, first_name, last_name, email`,
        [req.user.companyId, employeeCode, firstName, lastName, email, phone || null,
         passwordHash, department || null, jobTitle || null, joinDate]
      );

      // Seed leave balances for the current year (adjust defaults as needed)
      const year = new Date().getFullYear();
      await pool.query(
        `INSERT INTO leave_balances (user_id, leave_type, allocated, year) VALUES
         ($1,'paid',24,$2), ($1,'sick',7,$2), ($1,'unpaid',0,$2)`,
        [result.rows[0].id, year]
      );

      const emailSent = await sendWelcomeEmail({
        to: email,
        name: `${firstName} ${lastName}`,
        employeeCode,
        password: tempPassword,
      });

      res.status(201).json({
        message: emailSent
          ? 'Employee created. Welcome email sent with login credentials.'
          : 'Employee created. Could not send email. Share credentials manually.',
        employee: result.rows[0],
        tempPassword,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error creating employee' });
    }
  }
);

// GET /api/employees  (any authenticated user)
// Powers the card-grid view — includes today's live attendance status per employee.
router.get('/', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { rows } = await pool.query(
      `SELECT u.id, u.employee_code, u.first_name, u.last_name, u.department,
              u.job_title, u.profile_pic_url,
              COALESCE(a.status, 'absent') AS status,
              a.check_in, a.check_out
       FROM users u
       LEFT JOIN attendance a ON a.user_id = u.id AND a.date = $1
       WHERE u.company_id = $2 AND u.role != 'admin'
       ORDER BY u.first_name`,
      [today, req.user.companyId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching employees' });
  }
});

// PUT /api/employees/:id/resume  (self — update own skills, certifications, about)
router.put(
  '/:id/resume',
  requireAuth,
  async (req, res) => {
    const empId = parseInt(req.params.id, 10);
    if (isNaN(empId)) return res.status(400).json({ error: 'Invalid employee ID' });
    if (req.user.id !== empId) return res.status(403).json({ error: 'Can only update your own resume' });

    const { about, skills, certifications } = req.body;

    try {
      const result = await pool.query(
        `UPDATE users SET
           about = COALESCE($1, about),
           skills = COALESCE($2, skills),
           certifications = COALESCE($3, certifications)
         WHERE id = $4 AND company_id = $5
         RETURNING id, about, skills, certifications`,
        [
          about !== undefined ? about : null,
          skills !== undefined ? JSON.stringify(skills) : null,
          certifications !== undefined ? JSON.stringify(certifications) : null,
          empId, req.user.companyId,
        ]
      );

      if (!result.rows.length) return res.status(404).json({ error: 'Employee not found' });
      res.json({ message: 'Resume updated', resume: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating resume' });
    }
  }
);

// PUT /api/employees/:id  (Admin/HR only — update employee details)
router.put(
  '/:id',
  requireAuth,
  requireRole('admin', 'hr'),
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('joiningDate').optional().isISO8601(),
    body('department').optional().trim().isLength({ max: 100 }),
    body('jobTitle').optional().trim().isLength({ max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const empId = parseInt(req.params.id, 10);
    if (isNaN(empId)) return res.status(400).json({ error: 'Invalid employee ID' });

    try {
      const existing = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [empId, req.user.companyId]
      );
      if (!existing.rows.length) return res.status(404).json({ error: 'Employee not found' });

      if (req.body.email) {
        const emailCheck = await pool.query(
          'SELECT id FROM users WHERE email = $1 AND id != $2',
          [req.body.email, empId]
        );
        if (emailCheck.rows.length) return res.status(409).json({ error: 'Email already in use' });
      }

      const { firstName, lastName, email, phone, department, jobTitle, joiningDate } = req.body;

      const result = await pool.query(
        `UPDATE users SET
           first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           department = COALESCE($5, department),
           job_title = COALESCE($6, job_title),
           joining_date = COALESCE($7, joining_date)
         WHERE id = $8 AND company_id = $9
         RETURNING id, employee_code, first_name, last_name, email, phone, department, job_title, joining_date`,
        [firstName, lastName, email, phone, department, jobTitle, joiningDate, empId, req.user.companyId]
      );

      res.json({ message: 'Employee updated', employee: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating employee' });
    }
  }
);

// GET /api/employees/:id  (any authenticated user — used for view-only profile modal)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const empId = parseInt(req.params.id, 10);
    if (isNaN(empId)) return res.status(400).json({ error: 'Invalid employee ID' });

    const { rows } = await pool.query(
      `SELECT id, employee_code, first_name, last_name, email, phone,
              department, job_title, joining_date, profile_pic_url, role,
              about, skills, certifications
       FROM users WHERE id = $1 AND company_id = $2`,
      [empId, req.user.companyId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Employee not found' });

    const isSelf = req.user.id === empId;
    const isAdmin = ['admin', 'hr'].includes(req.user.role);

    let salary = null;
    if (isSelf || isAdmin) {
      const salaryRes = await pool.query('SELECT * FROM salary WHERE user_id = $1', [empId]);
      salary = salaryRes.rows[0] || null;
    }

    res.json({ ...rows[0], salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching employee profile' });
  }
});

module.exports = router;
