-- Migration: Admin invite flow
-- Run this SQL against your PostgreSQL database before deploying the admin invite feature.

-- 1. Make gstNumber, mobile, businessType nullable for admin users
ALTER TABLE users ALTER COLUMN gst_number DROP NOT NULL;
ALTER TABLE users ALTER COLUMN mobile DROP NOT NULL;
ALTER TABLE users ALTER COLUMN business_type DROP NOT NULL;

-- 2. Create admin_invitations table
CREATE TABLE IF NOT EXISTS admin_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL,
  token       VARCHAR(500) UNIQUE NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | accepted | expired
  invited_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);
