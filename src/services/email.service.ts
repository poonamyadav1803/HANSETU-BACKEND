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
