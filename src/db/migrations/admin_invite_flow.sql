-- Migration: Admin invite flow (separate admin_users table)
-- Run this SQL against your PostgreSQL database before deploying the admin invite feature.

-- 1. Create admin_users table (separate from business users)
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  username    VARCHAR(100) UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- 2. Create admin_invitations table (invited_by references admin_users)
CREATE TABLE IF NOT EXISTS admin_invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) NOT NULL,
  token       VARCHAR(500) UNIQUE NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | accepted | expired
  invited_by  UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at  TIMESTAMP NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- 3. Seed first super-admin (update the values below before running)
-- INSERT INTO admin_users (email, username, password, first_name, last_name, is_active)
-- VALUES ('admin@hansetu.com', 'superadmin', '<bcrypt_hash_of_password>', 'Super', 'Admin', true);
