import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";

let _razorpay: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
}

export async function createOrder(params: {
  amountInPaise: number; // total_amount × 100 (Razorpay uses smallest currency unit)
  receipt: string;       // invoice number
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const rz = getRazorpay();
  const order = await rz.orders.create({
    amount: params.amountInPaise,
    currency: "INR",
    receipt: params.receipt,
    notes: params.notes,
  });
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");
  return expected === params.razorpaySignature;
}
