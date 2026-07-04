const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const pool = require('./db');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave');
const salaryRoutes = require('./routes/salary');

async function migrate() {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS about TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb`);
    console.log('Migration complete: users table has about, skills, certifications columns');
  } catch (err) {
    console.error('Migration error (non-fatal):', err.message);
  }
}

const app = express();
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:3000',
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/salary', salaryRoutes);

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
migrate().then(() => {
  app.listen(PORT, () => console.log(`HRMS backend running on port ${PORT}`));
});
