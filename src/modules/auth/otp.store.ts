/**
 * In-memory OTP store with TTL.
 * Key: "<type>:<identifier>"  e.g. "phone:9876543210" or "email:user@example.com"
 * TTL: 10 minutes
 */

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const store = new Map<string, OtpEntry>();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function makeKey(type: "phone" | "email", identifier: string): string {
  return `${type}:${identifier}`;
}

export const otpStore = {
  set(type: "phone" | "email", identifier: string, code: string): void {
    store.set(makeKey(type, identifier), {
      code,
      expiresAt: Date.now() + OTP_TTL_MS,
    });
  },

  verify(type: "phone" | "email", identifier: string, code: string): boolean {
    const key = makeKey(type, identifier);
    const entry = store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return false;
    }
    if (entry.code !== code) return false;
    store.delete(key); // consume OTP
    return true;
  },

  has(type: "phone" | "email", identifier: string): boolean {
    const key = makeKey(type, identifier);
    const entry = store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return false;
    }
    return true;
  },
};

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
