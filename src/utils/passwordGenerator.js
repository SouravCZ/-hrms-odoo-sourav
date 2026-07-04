const crypto = require('crypto');

function generatePassword(length = 12) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;

  let password = '';
  const bytes = crypto.randomBytes(length);

  password += uppercase[bytes[0] % uppercase.length];
  password += lowercase[bytes[1] % lowercase.length];
  password += numbers[bytes[2] % numbers.length];
  password += special[bytes[3] % special.length];

  for (let i = 4; i < length; i++) {
    password += all[bytes[i] % all.length];
  }

  return password.split('').sort(() => crypto.randomBytes(1)[0] % 2 - 0.5).join('');
}

function isValidPassword(password) {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
}

module.exports = { generatePassword, isValidPassword };
