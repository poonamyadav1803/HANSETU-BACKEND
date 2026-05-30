import nodemailer from "nodemailer";
import { env } from "../config/env";

function createTransport() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendAdminInviteEmail(to: string, inviteLink: string): Promise<void> {
  const transporter = createTransport();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "You've been invited to join Hansetu as an Admin",
    text: `You have been invited to register as an admin on Hansetu. Use this link to complete your registration:\n\n${inviteLink}\n\nThis link expires in 48 hours.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1d4ed8;">Hansetu Admin Invitation</h2>
        <p>You have been invited to register as an administrator on the Hansetu platform.</p>
        <p>Click the button below to complete your registration:</p>
        <a href="${inviteLink}" style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:12px 0;">
          Complete Registration
        </a>
        <p style="color:#64748b;font-size:0.875rem;">
          This invitation link expires in <strong>48 hours</strong>. If you did not expect this invitation, you can safely ignore this email.
        </p>
        <p style="color:#94a3b8;font-size:0.75rem;">Or copy this link: ${inviteLink}</p>
      </div>
    `,
  });
}

export async function sendAdminApprovalEmail(to: string): Promise<void> {
  const transporter = createTransport();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Your Hansetu Admin Account has been Approved",
    text: `Congratulations! Your admin registration on Hansetu has been approved. You can now log in to the admin panel.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#16a34a;">Account Approved</h2>
        <p>Congratulations! Your admin registration on <strong>Hansetu</strong> has been reviewed and approved.</p>
        <p>You can now log in to the admin panel using your registered credentials.</p>
        <p style="color:#64748b;font-size:0.875rem;">
          If you have any questions, please contact the Hansetu support team.
        </p>
      </div>
    `,
  });
}

export async function sendAdminPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transporter = createTransport();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Reset your Hansetu Admin password",
    text: `You requested a password reset for your Hansetu Admin account.\n\nClick the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1e293b;">Reset Your Admin Password</h2>
        <p>We received a request to reset the password for your <strong>Hansetu Admin</strong> account.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#1e293b;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:12px 0;">
          Reset Admin Password
        </a>
        <p style="color:#64748b;font-size:0.875rem;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.
        </p>
        <p style="color:#94a3b8;font-size:0.75rem;">Or copy this link: ${resetLink}</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transporter = createTransport();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Reset your Hansetu password",
    text: `You requested a password reset for your Hansetu account.\n\nClick the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1d4ed8;">Reset Your Password</h2>
        <p>We received a request to reset the password for your <strong>Hansetu</strong> account.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;margin:12px 0;">
          Reset Password
        </a>
        <p style="color:#64748b;font-size:0.875rem;">
          This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not change.
        </p>
        <p style="color:#94a3b8;font-size:0.75rem;">Or copy this link: ${resetLink}</p>
      </div>
    `,
  });
}

export async function sendRfqAdminNotification(
  rfqNumber: string,
  productName: string,
  category: string,
  deliveryLocation: string
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.SMTP_USER;
  if (!adminEmail) return;
  const transporter = createTransport();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: adminEmail,
    subject: `New RFQ Submitted — ${rfqNumber}`,
    text: `A new RFQ has been submitted on Hansetu.\n\nRFQ Number: ${rfqNumber}\nProduct: ${productName}\nCategory: ${category}\nDelivery Location: ${deliveryLocation}\n\nLog in to the admin panel to review and assign a supplier.`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;">
        <h2 style="color:#1d4ed8;">New RFQ Submitted</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;color:#64748b;width:40%;">RFQ Number</td><td style="padding:8px;font-weight:600;">${rfqNumber}</td></tr>
          <tr style="background:#f8fafc;"><td style="padding:8px;color:#64748b;">Product</td><td style="padding:8px;">${productName}</td></tr>
          <tr><td style="padding:8px;color:#64748b;">Category</td><td style="padding:8px;">${category}</td></tr>
          <tr style="background:#f8fafc;"><td style="padding:8px;color:#64748b;">Delivery Location</td><td style="padding:8px;">${deliveryLocation}</td></tr>
        </table>
        <p style="color:#64748b;font-size:0.875rem;">Log in to the admin panel to review this RFQ and assign a supplier.</p>
      </div>
    `,
  });
}

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const transporter = createTransport();

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Your Hansetu Verification OTP",
    text: `Your OTP is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1d4ed8;">Hansetu Email Verification</h2>
        <p>Use the OTP below to verify your email address:</p>
        <div style="font-size:2rem;font-weight:700;letter-spacing:0.3rem;padding:16px 24px;background:#f1f5f9;border-radius:8px;display:inline-block;margin:12px 0;">
          ${otp}
        </div>
        <p style="color:#64748b;font-size:0.875rem;">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
  });
}
