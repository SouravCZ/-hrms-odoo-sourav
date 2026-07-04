const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Turns raw stored % fields into the ₹ breakdown shown on the Salary Info tab
function computeBreakdown(salary) {
  if (!salary) return null;
  const wage = parseFloat(salary.month_wage) || 0;
  const basicAmount = wage * (parseFloat(salary.basic_pct) / 100);
  const hraAmount = basicAmount * (parseFloat(salary.hra_pct) / 100);
  const pfEmployeeAmount = basicAmount * (parseFloat(salary.pf_employee_pct) / 100);
  const pfEmployerAmount = basicAmount * (parseFloat(salary.pf_employer_pct) / 100);

  return {
    monthWage: wage,
    yearlyWage: wage * 12,
    earnings: {
      basicSalary: round2(basicAmount),
      hra: round2(hraAmount),
      standardAllowance: parseFloat(salary.standard_allowance) || 0,
      performanceBonus: parseFloat(salary.performance_bonus) || 0,
      leaveTravelAllowance: parseFloat(salary.leave_travel_allowance) || 0,
      fixedAllowance: parseFloat(salary.fixed_allowance) || 0,
    },
    deductions: {
      providentFundEmployee: round2(pfEmployeeAmount),
      providentFundEmployer: round2(pfEmployerAmount),
      professionalTax: parseFloat(salary.professional_tax) || 0,
    },
  };
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

// GET /api/salary/:userId  (self, or Admin/HR viewing any employee)
router.get('/:userId', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.userId, 10);
  const isSelf = req.user.id === targetId;
  const isAdmin = ['admin', 'hr'].includes(req.user.role);
  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Not authorized to view this salary information' });
  }

  try {
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND company_id = $2', [targetId, req.user.companyId]);
    if (!userCheck.rows.length) return res.status(404).json({ error: 'Employee not found' });

    const { rows } = await pool.query('SELECT * FROM salary WHERE user_id = $1', [targetId]);
    if (!rows.length) return res.status(404).json({ error: 'No salary record found for this employee' });
    res.json(computeBreakdown(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching salary info' });
  }
});

// PUT /api/salary/:userId  (Admin only — sets/updates salary structure)
router.put(
  '/:userId',
  requireAuth,
  requireRole('admin'),
  [
    body('monthWage').isFloat({ min: 0 }).withMessage('monthWage must be a positive number'),
    body('basicPct').optional().isFloat({ min: 0, max: 100 }),
    body('hraPct').optional().isFloat({ min: 0, max: 100 }),
    body('standardAllowance').optional().isFloat({ min: 0 }),
    body('performanceBonus').optional().isFloat({ min: 0 }),
    body('leaveTravelAllowance').optional().isFloat({ min: 0 }),
    body('fixedAllowance').optional().isFloat({ min: 0 }),
    body('pfEmployeePct').optional().isFloat({ min: 0, max: 100 }),
    body('pfEmployerPct').optional().isFloat({ min: 0, max: 100 }),
    body('professionalTax').optional().isFloat({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      monthWage, basicPct, hraPct, standardAllowance, performanceBonus,
      leaveTravelAllowance, fixedAllowance, pfEmployeePct, pfEmployerPct, professionalTax,
    } = req.body;

    try {
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1 AND company_id = $2', [req.params.userId, req.user.companyId]);
      if (!userCheck.rows.length) return res.status(404).json({ error: 'Employee not found' });

      const existing = await pool.query('SELECT id FROM salary WHERE user_id = $1', [req.params.userId]);

      let result;
      if (existing.rows.length) {
        result = await pool.query(
          `UPDATE salary SET
             month_wage = $1, basic_pct = COALESCE($2, basic_pct), hra_pct = COALESCE($3, hra_pct),
             standard_allowance = COALESCE($4, standard_allowance),
             performance_bonus = COALESCE($5, performance_bonus),
             leave_travel_allowance = COALESCE($6, leave_travel_allowance),
             fixed_allowance = COALESCE($7, fixed_allowance),
             pf_employee_pct = COALESCE($8, pf_employee_pct),
             pf_employer_pct = COALESCE($9, pf_employer_pct),
             professional_tax = COALESCE($10, professional_tax),
             updated_at = NOW()
           WHERE user_id = $11 RETURNING *`,
          [monthWage, basicPct, hraPct, standardAllowance, performanceBonus,
           leaveTravelAllowance, fixedAllowance, pfEmployeePct, pfEmployerPct, professionalTax,
           req.params.userId]
        );
      } else {
        result = await pool.query(
          `INSERT INTO salary
            (user_id, month_wage, basic_pct, hra_pct, standard_allowance, performance_bonus,
             leave_travel_allowance, fixed_allowance, pf_employee_pct, pf_employer_pct, professional_tax)
           VALUES ($1,$2,COALESCE($3,50),COALESCE($4,50),COALESCE($5,0),COALESCE($6,0),
                   COALESCE($7,0),COALESCE($8,0),COALESCE($9,12),COALESCE($10,13.75),COALESCE($11,200))
           RETURNING *`,
          [req.params.userId, monthWage, basicPct, hraPct, standardAllowance, performanceBonus,
           leaveTravelAllowance, fixedAllowance, pfEmployeePct, pfEmployerPct, professionalTax]
        );
      }

      res.json({ message: 'Salary updated', salary: computeBreakdown(result.rows[0]) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error updating salary info' });
    }
  }
);

module.exports = router;
