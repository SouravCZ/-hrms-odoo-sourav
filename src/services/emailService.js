const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail({ to, name, employeeCode, password }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to HRMS - Your Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome to HRMS, ${name}!</h2>
        <p>Your account has been created. Here are your login credentials:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Login ID:</strong> ${employeeCode}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p><strong>Important:</strong> You will be required to change your password on first login for security purposes.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not share these credentials with anyone.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send welcome email:', err.message);
    return false;
  }
}

async function sendPasswordResetEmail({ to, name, newPassword }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'HRMS - Your Password Has Been Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Password Reset, ${name}</h2>
        <p>Your password has been reset by an administrator. Here is your new temporary password:</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>New Password:</strong> ${newPassword}</p>
        </div>
        <p><strong>Important:</strong> You will be required to change this password on your next login.</p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not share these credentials with anyone.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send password reset email:', err.message);
    return false;
  }
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };
