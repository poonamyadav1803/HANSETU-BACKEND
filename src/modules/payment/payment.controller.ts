import { Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import * as svc from "./payment.service";

const createOrderSchema = z.object({
  amount: z.number().int().min(100, "Amount must be at least 100 paise (₹1)"),
  receipt: z.string().optional(),
});

const verifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, receipt } = createOrderSchema.parse(req.body);
    const order = await svc.createRazorpayOrder(amount, receipt ?? `rcpt_${Date.now()}`);
    res.status(201).json(order);
  } catch (err) { next(err); }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      verifySchema.parse(req.body);
    const result = svc.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    res.json(result);
  } catch (err) { next(err); }
};
