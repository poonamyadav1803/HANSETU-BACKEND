import Razorpay from "razorpay";
import crypto from "crypto";
import { HttpException } from "../../core/HttpException";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createRazorpayOrder(amount: number, receipt: string) {
  if (amount < 100) {
    throw new HttpException(400, "Amount must be at least ₹1 (100 paise)");
  }

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt,
  });

  return {
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
  };
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const body = orderId + "|" + paymentId;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    throw new HttpException(400, "Payment verification failed: signature mismatch");
  }

  return { verified: true, paymentId, orderId };
}
