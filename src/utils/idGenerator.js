const pool = require('../db');

/**
 * Format: [CompanyCode][First2LettersFirstName+First2LettersLastName][JoiningYear][4-digit serial]
 * Example: OI + JO + DO + 2026 + 0001  -> OIJODO20260001
 * Retries with next serial if the generated code already exists.
 */
async function generateEmployeeCode(companyId, companyCode, firstName, lastName, joiningDate) {
  const year = new Date(joiningDate).getFullYear();

  const namePart = (
    firstName.slice(0, 2) + lastName.slice(0, 2)
  ).toUpperCase().padEnd(4, 'X');

  const prefix = `${companyCode.toUpperCase()}${namePart}${year}`;

  for (let attempt = 0; attempt < 100; attempt++) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM users
       WHERE company_id = $1
       AND EXTRACT(YEAR FROM joining_date) = $2`,
      [companyId, year]
    );

    const serial = (parseInt(rows[0].count, 10) + 1 + attempt).toString().padStart(4, '0');
    const code = `${prefix}${serial}`;

    const existing = await pool.query(
      'SELECT id FROM users WHERE employee_code = $1',
      [code]
    );

    if (!existing.rows.length) return code;
  }

  throw new Error('Could not generate a unique employee code');
}

function deriveCompanyCode(companyName) {
  const words = companyName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return companyName.slice(0, 2).toUpperCase();
}

module.exports = { generateEmployeeCode, deriveCompanyCode };
