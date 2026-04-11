-- ─────────────────────────────────────────────────────────────────────────────
-- Hansetu — Initial Database Schema
-- Migration: 0000_initial_schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation (Neon/PostgreSQL 13+ has this built-in)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  "id"               uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "gst_number"       varchar(20) UNIQUE NOT NULL,
  "email"            varchar(255) UNIQUE NOT NULL,
  "mobile"           varchar(15)  UNIQUE NOT NULL,
  "username"         varchar(100) UNIQUE NOT NULL,
  "password"         text        NOT NULL,
  "business_type"    varchar(50) NOT NULL,
  "email_verified"   boolean     DEFAULT false,
  "mobile_verified"  boolean     DEFAULT false,
  "is_active"        boolean     DEFAULT true,
  "created_at"       timestamp   DEFAULT now(),
  "updated_at"       timestamp   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "users_email_idx"      ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_gst_number_idx" ON "users" ("gst_number");

-- ─────────────────────────────────────────────────────────────────────────────
-- Industries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "industries" (
  "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug"        varchar(100) UNIQUE NOT NULL,
  "name"        varchar(255) NOT NULL,
  "description" text,
  "icon_url"    varchar(500),
  "is_active"   boolean     DEFAULT true,
  "created_at"  timestamp   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "industries_slug_idx" ON "industries" ("slug");

-- ─────────────────────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "categories" (
  "id"              uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug"            varchar(100) UNIQUE NOT NULL,
  "name"            varchar(255) NOT NULL,
  "description"     text,
  "primary_color"   varchar(200),
  "secondary_color" varchar(200),
  "gradient_color"  varchar(200),
  "badge_color"     varchar(200),
  "is_active"       boolean     DEFAULT true,
  "created_at"      timestamp   DEFAULT now(),
  "updated_at"      timestamp   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "categories_slug_idx" ON "categories" ("slug");

-- ─────────────────────────────────────────────────────────────────────────────
-- Subcategories
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "subcategories" (
  "id"          uuid        PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "category_id" uuid        NOT NULL REFERENCES "categories" ("id") ON DELETE CASCADE,
  "name"        varchar(255) NOT NULL,
  "created_at"  timestamp   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "subcategories_category_id_idx" ON "subcategories" ("category_id");

-- ─────────────────────────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "products" (
  "id"             uuid          PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "category_id"    uuid          NOT NULL REFERENCES "categories" ("id") ON DELETE CASCADE,
  "subcategory_id" uuid          REFERENCES "subcategories" ("id") ON DELETE SET NULL,
  "name"           varchar(500)  NOT NULL,
  "price"          numeric(10,2) NOT NULL,
  "original_price" numeric(10,2),
  "rating"         numeric(3,1)  DEFAULT 0,
  "reviews"        integer       DEFAULT 0,
  "brand"          varchar(255),
  "in_stock"       boolean       DEFAULT true,
  "specs"          text,
  "description"    text,
  "created_at"     timestamp     DEFAULT now(),
  "updated_at"     timestamp     DEFAULT now()
);

CREATE TABLE otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "products_category_id_idx"    ON "products" ("category_id");
CREATE INDEX IF NOT EXISTS "products_subcategory_id_idx" ON "products" ("subcategory_id");
CREATE INDEX IF NOT EXISTS "products_brand_idx"          ON "products" ("brand");
CREATE INDEX IF NOT EXISTS "products_in_stock_idx"       ON "products" ("in_stock");
