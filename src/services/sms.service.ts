import twilio from "twilio";
import { env } from "../config/env";

export async function sendOtpSms(to: string, otp: string): Promise<void> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
    // Credentials not configured — log to console (dev/sandbox fallback)
    console.log(`[SMS OTP] To: ${to} | OTP: ${otp}`);
    return;
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  await client.messages.create({
    body: `Your Hansetu verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
    from: env.TWILIO_PHONE_NUMBER,
    to,
  });
}
