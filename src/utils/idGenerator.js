const crypto = require('crypto');
const pool = require('../db');

/**
 * Format: [CompanyCode][First2LettersFirstName+First2LettersLastName][JoiningYear][4-digit serial]
 * Example: OI + JO + DO + 2026 + 0001  -> OIJODO20260001
 * Serial resets per company per year, based on how many employees already joined that company that year.
 */
async function generateEmployeeCode(companyId, companyCode, firstName, lastName, joiningDate) {
  const year = new Date(joiningDate).getFullYear();

  const namePart = (
    firstName.slice(0, 2) + lastName.slice(0, 2)
  ).toUpperCase().padEnd(4, 'X');

  const { rows } = await pool.query(
    `SELECT COUNT(*) FROM users
     WHERE company_id = $1
     AND EXTRACT(YEAR FROM joining_date) = $2`,
    [companyId, year]
  );

  const serial = (parseInt(rows[0].count, 10) + 1).toString().padStart(4, '0');

  return `${companyCode.toUpperCase()}${namePart}${year}${serial}`;
}

function generateTempPassword() {
  // Readable temp password: 2 letters + 4 digits + 1 symbol, e.g. "Ab3492!"
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const l1 = letters[crypto.randomInt(letters.length)];
  const l2 = letters[crypto.randomInt(letters.length)].toLowerCase();
  const digits = crypto.randomInt(1000, 9999);
  const symbols = '!@#$%';
  const sym = symbols[crypto.randomInt(symbols.length)];
  return `${l1}${l2}${digits}${sym}`;
}

function deriveCompanyCode(companyName) {
  const words = companyName.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return companyName.slice(0, 2).toUpperCase();
}

module.exports = { generateEmployeeCode, generateTempPassword, deriveCompanyCode };
