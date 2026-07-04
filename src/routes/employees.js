const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { generateEmployeeCode, generateTempPassword } = require('../utils/idGenerator');
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
      const tempPassword = generateTempPassword();
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

      // Temp password is returned once here for the Admin to hand off manually
      // (no email-sending step — out of scope for the hackathon window).
      res.status(201).json({
        message: 'Employee created',
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
              COALESCE(a.status, 'absent') AS status
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

// GET /api/employees/:id  (any authenticated user — used for view-only profile modal)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, employee_code, first_name, last_name, email, phone,
              department, job_title, joining_date, profile_pic_url, role
       FROM users WHERE id = $1 AND company_id = $2`,
      [req.params.id, req.user.companyId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Employee not found' });

    const isSelf = req.user.id === parseInt(req.params.id, 10);
    const isAdmin = ['admin', 'hr'].includes(req.user.role);

    let salary = null;
    if (isSelf || isAdmin) {
      const salaryRes = await pool.query('SELECT * FROM salary WHERE user_id = $1', [req.params.id]);
      salary = salaryRes.rows[0] || null;
    }

    res.json({ ...rows[0], salary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching employee profile' });
  }
});

module.exports = router;
