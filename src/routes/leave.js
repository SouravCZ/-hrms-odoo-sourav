const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1; // inclusive of both dates
}

// GET /api/leave/balances  (self — feeds the "Paid Time Off: 24 Days" cards)
router.get('/balances', requireAuth, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const { rows } = await pool.query(
      `SELECT leave_type, allocated, used, (allocated - used) AS remaining
       FROM leave_balances WHERE user_id = $1 AND year = $2`,
      [req.user.id, year]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching leave balances' });
  }
});

// POST /api/leave/requests  (self — the "New Request" modal submit)
// Accepts multipart/form-data if an attachment is included, otherwise plain JSON works too.
router.post(
  '/requests',
  requireAuth,
  upload.single('attachment'),
  [
    body('leaveType').isIn(['paid', 'sick', 'unpaid']).withMessage('Invalid leave type'),
    body('startDate').isISO8601().withMessage('Valid start date required'),
    body('endDate').isISO8601().withMessage('Valid end date required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { leaveType, startDate, endDate, remarks } = req.body;
    const days = daysBetween(startDate, endDate);
    if (days <= 0) return res.status(400).json({ error: 'End date must be on or after start date' });

    try {
      // Check balance for paid/sick (unpaid has no cap)
      if (leaveType !== 'unpaid') {
        const year = new Date().getFullYear();
        const balRes = await pool.query(
          `SELECT allocated, used FROM leave_balances WHERE user_id = $1 AND leave_type = $2 AND year = $3`,
          [req.user.id, leaveType, year]
        );
        const bal = balRes.rows[0];
        if (bal && (bal.allocated - bal.used) < days) {
          return res.status(400).json({ error: `Insufficient ${leaveType} balance for ${days} day(s)` });
        }
      }

      const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const result = await pool.query(
        `INSERT INTO leave_requests
          (user_id, leave_type, start_date, end_date, days, remarks, attachment_url, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
         RETURNING *`,
        [req.user.id, leaveType, startDate, endDate, days, remarks || null, attachmentUrl]
      );

      res.status(201).json({ message: 'Leave request submitted', request: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error submitting leave request' });
    }
  }
);

// GET /api/leave/requests/me  (self — employee's own history table)
router.get('/requests/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM leave_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching leave history' });
  }
});

// GET /api/leave/requests?status=pending  (Admin/HR — the approve/reject queue)
router.get('/requests', requireAuth, requireRole('admin', 'hr'), async (req, res) => {
  try {
    const statusFilter = req.query.status;
    if (statusFilter && !['pending', 'approved', 'rejected'].includes(statusFilter)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }
    const params = [req.user.companyId];
    let query = `
      SELECT lr.*, u.first_name, u.last_name, u.employee_code
      FROM leave_requests lr
      JOIN users u ON u.id = lr.user_id
      WHERE u.company_id = $1`;
    if (statusFilter) {
      params.push(statusFilter);
      query += ` AND lr.status = $2`;
    }
    query += ' ORDER BY lr.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching leave requests' });
  }
});

// PATCH /api/leave/requests/:id  (Admin/HR — Approve/Reject buttons)
router.patch(
  '/requests/:id',
  requireAuth,
  requireRole('admin', 'hr'),
  [body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { status } = req.body;
    try {
      const reqRes = await pool.query(
        `SELECT lr.*, u.company_id FROM leave_requests lr
         JOIN users u ON u.id = lr.user_id
         WHERE lr.id = $1`,
        [req.params.id]
      );
      const leaveReq = reqRes.rows[0];
      if (!leaveReq) return res.status(404).json({ error: 'Leave request not found' });
      if (leaveReq.company_id !== req.user.companyId) {
        return res.status(403).json({ error: 'Not authorized to review this request' });
      }
      if (leaveReq.status !== 'pending') {
        return res.status(409).json({ error: 'This request has already been reviewed' });
      }

      const updated = await pool.query(
        `UPDATE leave_requests SET status = $1, reviewed_by = $2, reviewed_at = NOW()
         WHERE id = $3 RETURNING *`,
        [status, req.user.id, req.params.id]
      );

      if (status === 'approved' && leaveReq.leave_type !== 'unpaid') {
        const startYear = new Date(leaveReq.start_date).getFullYear();
        const endYear = new Date(leaveReq.end_date).getFullYear();
        if (startYear === endYear) {
          await pool.query(
            `UPDATE leave_balances SET used = used + $1
             WHERE user_id = $2 AND leave_type = $3 AND year = $4`,
            [leaveReq.days, leaveReq.user_id, leaveReq.leave_type, startYear]
          );
        } else {
          const daysStartYear = daysBetween(leaveReq.start_date, `${startYear}-12-31`);
          const daysEndYear = leaveReq.days - daysStartYear;
          await pool.query(
            `UPDATE leave_balances SET used = used + $1
             WHERE user_id = $2 AND leave_type = $3 AND year = $4`,
            [daysStartYear, leaveReq.user_id, leaveReq.leave_type, startYear]
          );
          await pool.query(
            `UPDATE leave_balances SET used = used + $1
             WHERE user_id = $2 AND leave_type = $3 AND year = $4`,
            [daysEndYear, leaveReq.user_id, leaveReq.leave_type, endYear]
          );
        }
      }

      res.json({ message: `Request ${status}`, request: updated.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error reviewing leave request' });
    }
  }
);

module.exports = router;
