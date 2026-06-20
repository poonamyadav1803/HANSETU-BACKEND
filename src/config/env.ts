import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || 'hansetu-secret',
  WHITEBOOKS_GST_API_URL:
    process.env.WHITEBOOKS_GST_API_URL ||
    'https://apisandbox.whitebooks.in/public/search',
  WHITEBOOKS_GST_EMAIL: process.env.WHITEBOOKS_GST_EMAIL || '',
  WHITEBOOKS_CLIENT_ID: process.env.WHITEBOOKS_CLIENT_ID || '',
  WHITEBOOKS_CLIENT_SECRET: process.env.WHITEBOOKS_CLIENT_SECRET || '',
  // Nodemailer
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'Hansetu <noreply@hansetu.com>',
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_T15MfBYXLfMM6G',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'l1625LaEQO3xqY3o2Vdqpc9b',
  // S3 uploads
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-2',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'AKIAT4XN4JEUW7LRDP74',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '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',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'hansetu-media',
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL || 'https://hansetu.com',
};
