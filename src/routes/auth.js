const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { generateEmployeeCode, deriveCompanyCode } = require('../utils/idGenerator');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup-company
// One-time: creates the company + its first Admin account.
router.post(
  '/signup-company',
  [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('adminName').trim().notEmpty().withMessage('Admin name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().isMobilePhone('any'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { companyName, adminName, email, phone, password, logoUrl } = req.body;

    try {
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const companyCode = deriveCompanyCode(companyName);
      const companyResult = await pool.query(
        'INSERT INTO companies (name, code, logo_url) VALUES ($1, $2, $3) RETURNING id, code',
        [companyName, companyCode, logoUrl || null]
      );
      const company = companyResult.rows[0];

      const [firstName, ...rest] = adminName.trim().split(' ');
      const lastName = rest.join(' ') || firstName;

      const employeeCode = await generateEmployeeCode(
        company.id, company.code, firstName, lastName, new Date()
      );

      const passwordHash = await bcrypt.hash(password, 10);

      const userResult = await pool.query(
        `INSERT INTO users
          (company_id, employee_code, first_name, last_name, email, phone, password_hash, role, force_password_change)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'admin', FALSE)
         RETURNING id, employee_code, email, role`,
        [company.id, employeeCode, firstName, lastName, email, phone || null, passwordHash]
      );

      const admin = userResult.rows[0];
      const token = jwt.sign(
        { id: admin.id, companyId: company.id, role: admin.role, forcePasswordChange: false },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.status(201).json({
        message: 'Company and admin account created',
        company,
        admin,
        token,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error creating company/admin' });
    }
  }
);

// POST /api/auth/login
// Accepts either employee_code or email as the identifier.
router.post(
  '/login',
  [
    body('identifier').trim().notEmpty().withMessage('Login ID or email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { identifier, password } = req.body;

    try {
      const { rows } = await pool.query(
        `SELECT * FROM users WHERE employee_code = $1 OR email = $1`,
        [identifier]
      );
      const user = rows[0];
      if (!user) return res.status(401).json({ error: 'Invalid login ID/email or password' });

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(401).json({ error: 'Invalid login ID/email or password' });

      const token = jwt.sign(
        {
          id: user.id,
          companyId: user.company_id,
          role: user.role,
          forcePasswordChange: user.force_password_change,
        },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          employeeCode: user.employee_code,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
          forcePasswordChange: user.force_password_change,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

// POST /api/auth/change-password
// Self: no employeeCode needed (changes own password).
// Admin/HR: send employeeCode to set that employee's password.
router.post(
  '/change-password',
  requireAuth,
  [
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    body('employeeCode').optional().trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { newPassword, employeeCode } = req.body;
    try {
      let targetUserId = req.user.id;

      if (employeeCode) {
        if (!['admin', 'hr'].includes(req.user.role)) {
          return res.status(403).json({ error: 'Only admin or hr can change another employee\'s password' });
        }
        const { rows } = await pool.query(
          `SELECT id FROM users WHERE employee_code = $1 AND company_id = $2`,
          [employeeCode, req.user.companyId]
        );
        if (!rows.length) {
          return res.status(404).json({ error: 'Employee not found' });
        }
        targetUserId = rows[0].id;
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await pool.query(
        `UPDATE users SET password_hash = $1, force_password_change = FALSE WHERE id = $2`,
        [passwordHash, targetUserId]
      );
      res.json({ message: 'Password updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating password' });
    }
  }
);

module.exports = router;
