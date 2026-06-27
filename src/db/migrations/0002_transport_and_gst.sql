-- Add transporter email + phone to rfq_assignments
ALTER TABLE "rfq_assignments"
  ADD COLUMN IF NOT EXISTS "transporter_email" varchar(255),
  ADD COLUMN IF NOT EXISTS "transporter_phone" varchar(50);

-- Add transport details + payment tracking to purchase_orders
ALTER TABLE "purchase_orders"
  ADD COLUMN IF NOT EXISTS "transport_company" varchar(255),
  ADD COLUMN IF NOT EXISTS "transporter_email" varchar(255),
  ADD COLUMN IF NOT EXISTS "transporter_phone" varchar(50),
  ADD COLUMN IF NOT EXISTS "supplier_payment_id" varchar(100),
  ADD COLUMN IF NOT EXISTS "supplier_paid_at" timestamp,
  ADD COLUMN IF NOT EXISTS "transporter_payment_id" varchar(100),
  ADD COLUMN IF NOT EXISTS "transporter_paid_at" timestamp;
