import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

/**
 * Reusable nodemailer transporter (created once, reused across calls).
 */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 587,
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Send an email.
 *
 * @param {Object}  options
 * @param {string}  options.to       - Recipient email
 * @param {string}  options.subject  - Email subject
 * @param {string}  [options.text]   - Plain text body
 * @param {string}  [options.html]   - HTML body
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 *
 * Usage:
 *   import { sendMail } from "@/services/mailer";
 *
 *   await sendMail({
 *     to: "user@example.com",
 *     subject: "Welcome!",
 *     html: "<h1>Hello</h1>",
 *   });
 */
export async function sendMail({ to, subject, text, html, from }) {
  try {
    const info = await transporter.sendMail({
      from: from || SMTP_FROM || SMTP_USER,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Mailer] Send failed:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Pre-built email templates.
 * Call these instead of building HTML manually every time.
 */

// ─── Email Verification ───
export async function sendVerificationEmail({ to, name, verificationToken, baseUrl }) {
  const verifyLink = `${baseUrl}/verify-email?token=${verificationToken}`;
  return sendMail({
    to,
    subject: "Verify Your Email",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1e293b;">Hello ${name || "User"},</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyLink}"
           style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">
          Verify Email
        </a>
        <p style="color:#64748b;font-size:14px;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
}

// ─── Password Reset ───
export async function sendPasswordResetEmail({ to, name, resetToken, baseUrl }) {
  const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
  return sendMail({
    to,
    subject: "Reset Your Password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1e293b;">Hello ${name || "User"},</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#fff;
                  text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#64748b;font-size:14px;">This link expires in 15 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

// ─── Welcome Email (after registration) ───
export async function sendWelcomeEmail({ to, name }) {
  return sendMail({
    to,
    subject: "Welcome to SARKAR CAREER ACADEMY",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1e293b;">Welcome, ${name || "User"}!</h2>
        <p>Your account has been created successfully. Start exploring courses and begin your learning journey.</p>
        <p style="color:#64748b;font-size:14px;">If you have any questions, feel free to reach out to our support team.</p>
      </div>
    `,
  });
}

// ─── Payment Confirmation ───
export async function sendPaymentConfirmationEmail({ to, name, courseName, amount, transactionId }) {
  return sendMail({
    to,
    subject: "Payment Confirmed",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1e293b;">Payment Successful!</h2>
        <p>Hi ${name || "User"},</p>
        <p>Your payment has been confirmed. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 0;color:#64748b;">Course</td>
            <td style="padding:8px 0;font-weight:600;">${courseName}</td>
          </tr>
          <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:8px 0;color:#64748b;">Amount</td>
            <td style="padding:8px 0;font-weight:600;">₹${amount}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#64748b;">Transaction ID</td>
            <td style="padding:8px 0;font-weight:600;">${transactionId || "N/A"}</td>
          </tr>
        </table>
        <p style="color:#64748b;font-size:14px;">You can now access your course from the dashboard.</p>
      </div>
    `,
  });
}

// ─── Enrollment Confirmation ───
export async function sendEnrollmentEmail({ to, name, courseName }) {
  return sendMail({
    to,
    subject: `Enrolled: ${courseName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1e293b;">You're Enrolled!</h2>
        <p>Hi ${name || "User"},</p>
        <p>You have been successfully enrolled in <strong>${courseName}</strong>.</p>
        <p>Head to your dashboard to start learning.</p>
      </div>
    `,
  });
}
