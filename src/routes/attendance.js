const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

function nowTime() {
  return new Date().toTimeString().slice(0, 8); // HH:MM:SS
}
function today() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function isValidDate(str) {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}
function isValidMonth(str) {
  return /^\d{4}-\d{2}$/.test(str);
}
function timeToHours(t) {
  const [h, m, s] = t.split(':').map(Number);
  return h + m / 60 + (s || 0) / 3600;
}

// POST /api/attendance/check-in  (self)
router.post('/check-in', requireAuth, async (req, res) => {
  try {
    const date = today();
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [req.user.id, date]
    );
    if (existing.rows.length && existing.rows[0].check_in) {
      return res.status(409).json({ error: 'Already checked in today' });
    }

    const checkIn = nowTime();
    let row;
    if (existing.rows.length) {
      const result = await pool.query(
        `UPDATE attendance SET check_in = $1, status = 'present'
         WHERE user_id = $2 AND date = $3 RETURNING *`,
        [checkIn, req.user.id, date]
      );
      row = result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO attendance (user_id, date, check_in, status)
         VALUES ($1, $2, $3, 'present') RETURNING *`,
        [req.user.id, date, checkIn]
      );
      row = result.rows[0];
    }
    res.json({ message: 'Checked in', attendance: row });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error checking in' });
  }
});

// POST /api/attendance/check-out  (self)
router.post('/check-out', requireAuth, async (req, res) => {
  try {
    const date = today();
    const existing = await pool.query(
      'SELECT * FROM attendance WHERE user_id = $1 AND date = $2',
      [req.user.id, date]
    );
    if (!existing.rows.length || !existing.rows[0].check_in) {
      return res.status(400).json({ error: 'Must check in before checking out' });
    }
    if (existing.rows[0].check_out) {
      return res.status(409).json({ error: 'Already checked out today' });
    }

    const checkOut = nowTime();
    const checkIn = existing.rows[0].check_in;
    const workHours = Math.max(0, timeToHours(checkOut) - timeToHours(checkIn));
    const extraHours = Math.max(0, workHours - 8);

    const result = await pool.query(
      `UPDATE attendance SET check_out = $1, work_hours = $2, extra_hours = $3
       WHERE user_id = $4 AND date = $5 RETURNING *`,
      [checkOut, workHours.toFixed(2), extraHours.toFixed(2), req.user.id, date]
    );
    res.json({ message: 'Checked out', attendance: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error checking out' });
  }
});

// GET /api/attendance/day?date=YYYY-MM-DD  (Admin/HR — matches the admin single-day table view)
router.get('/day', requireAuth, requireRole('admin', 'hr'), async (req, res) => {
  try {
    const date = req.query.date || today();
    if (!isValidDate(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }
    const { rows } = await pool.query(
      `SELECT u.id AS user_id, u.first_name, u.last_name, u.employee_code,
              a.check_in, a.check_out, a.work_hours, a.extra_hours,
              COALESCE(a.status, 'absent') AS status
       FROM users u
       LEFT JOIN attendance a ON a.user_id = u.id AND a.date = $1
       WHERE u.company_id = $2 AND u.role != 'admin'
       ORDER BY u.first_name`,
      [date, req.user.companyId]
    );
    res.json({ date, records: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching day attendance' });
  }
});

// GET /api/attendance/me/month?month=YYYY-MM  (self — matches employee month view + summary chips)
router.get('/me/month', requireAuth, async (req, res) => {
  try {
    const month = req.query.month || today().slice(0, 7); // 'YYYY-MM'
    if (!isValidMonth(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }
    const start = `${month}-01`;

    const { rows } = await pool.query(
      `SELECT date, check_in, check_out, work_hours, extra_hours, status
       FROM attendance
       WHERE user_id = $1 AND date >= $2::date
             AND date < ($2::date + INTERVAL '1 month')
       ORDER BY date`,
      [req.user.id, start]
    );

    const daysPresent = rows.filter(r => r.status === 'present' || r.status === 'half_day').length;
    const leaves = rows.filter(r => r.status === 'leave').length;

    res.json({
      month,
      summary: {
        daysPresent,
        leaves,
        daysWithRecord: rows.length,
      },
      records: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching month attendance' });
  }
});

module.exports = router;
