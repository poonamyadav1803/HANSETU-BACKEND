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
  "role"             varchar(20) NOT NULL DEFAULT 'user',
  "email_verified"   boolean     DEFAULT false,
  "mobile_verified"  boolean     DEFAULT false,
  "is_active"        boolean     DEFAULT true,
  "profile"          jsonb,
  "created_at"       timestamp   DEFAULT now(),
  "updated_at"       timestamp   DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "users_email_idx"      ON "users" ("email");
CREATE INDEX IF NOT EXISTS "users_gst_number_idx" ON "users" ("gst_number");

CREATE TABLE IF NOT EXISTS "roles" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"        varchar(50) UNIQUE NOT NULL,
  "description" text,
  "created_at"  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "permissions" (
  "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"        varchar(100) UNIQUE NOT NULL,
  "resource"    varchar(50) NOT NULL,
  "action"      varchar(50) NOT NULL,
  "description" text,
  "created_at"  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_id"       uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
  "permission_id" uuid NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
  PRIMARY KEY ("role_id", "permission_id")
);

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
  "manufacturer_user_id" uuid    REFERENCES "users" ("id") ON DELETE SET NULL,
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
  "images"         jsonb         DEFAULT '[]'::jsonb NOT NULL,
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
CREATE INDEX IF NOT EXISTS "products_manufacturer_user_id_idx" ON "products" ("manufacturer_user_id");
CREATE INDEX IF NOT EXISTS "products_brand_idx"          ON "products" ("brand");
CREATE INDEX IF NOT EXISTS "products_in_stock_idx"       ON "products" ("in_stock");

-- ─────────────────────────────────────────────────────────────────────────────
-- GST Info (cache for Masters India API results)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "gst_info" (
  "id"                           uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "gst_number"                   varchar(20)  UNIQUE NOT NULL,
  "legal_name"                   varchar(500),
  "trade_name"                   varchar(500),
  "registration_status"          varchar(100),
  "date_of_registration"         varchar(50),
  "constitution_of_business"     varchar(255),
  "principal_place_of_business"  text,
  "nature_of_business_activities" text,
  "raw_api_response"             text,
  "created_at"                   timestamp    DEFAULT now(),
  "updated_at"                   timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "gst_info_gst_number_idx" ON "gst_info" ("gst_number");

-- ─────────────────────────────────────────────────────────────────────────────
-- Manufacturers
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "manufacturers" (
  "id"                  uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "industry_slug"       varchar(100) NOT NULL,
  "city"                varchar(100) NOT NULL,
  "state"               varchar(100) NOT NULL,
  "total_employees"     varchar(50),
  "turnover"            varchar(100),
  "year_established"    varchar(10),
  "certifications"      text,
  "in_house_testing"    boolean      DEFAULT false,
  "import_export"       boolean      DEFAULT false,
  "response_time"       varchar(50),
  "rating"              numeric(3,1) DEFAULT 0,
  "machine_capabilities" text,
  "is_active"           boolean      DEFAULT true,
  "created_at"          timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "manufacturers_industry_slug_idx" ON "manufacturers" ("industry_slug");

-- ─────────────────────────────────────────────────────────────────────────────
-- Raw Materials
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "raw_materials" (
  "id"               uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "industry_slug"    varchar(100) NOT NULL,
  "name"             varchar(500) NOT NULL,
  "category"         varchar(255),
  "price"            varchar(100) NOT NULL,
  "grade"            varchar(255),
  "city"             varchar(100),
  "imported"         boolean      DEFAULT false,
  "credit_available" boolean      DEFAULT false,
  "quantity"         varchar(100),
  "rating"           numeric(3,1) DEFAULT 0,
  "description"      text,
  "specifications"   text,
  "certification"    varchar(255),
  "delivery_time"    varchar(100),
  "min_order"        varchar(100),
  "is_active"        boolean      DEFAULT true,
  "created_at"       timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "raw_materials_industry_slug_idx" ON "raw_materials" ("industry_slug");
CREATE INDEX IF NOT EXISTS "raw_materials_category_idx"      ON "raw_materials" ("category");

-- ─────────────────────────────────────────────────────────────────────────────
-- Machines
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "machines" (
  "id"          uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"        varchar(500) NOT NULL,
  "category"    varchar(255) NOT NULL,
  "type"        varchar(255),
  "location"    varchar(100),
  "price"       varchar(100) NOT NULL,
  "specs"       text,
  "is_featured" boolean      DEFAULT false,
  "is_active"   boolean      DEFAULT true,
  "created_at"  timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "machines_category_idx"    ON "machines" ("category");
CREATE INDEX IF NOT EXISTS "machines_is_featured_idx" ON "machines" ("is_featured");

-- ─────────────────────────────────────────────────────────────────────────────
-- Offers
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "offers" (
  "id"             uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title"          varchar(500) NOT NULL,
  "description"    text,
  "discount"       varchar(20)  NOT NULL,
  "time_remaining" varchar(100),
  "category"       varchar(255),
  "is_featured"    boolean      DEFAULT false,
  "is_active"      boolean      DEFAULT true,
  "created_at"     timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "offers_is_featured_idx" ON "offers" ("is_featured");
CREATE INDEX IF NOT EXISTS "offers_category_idx"    ON "offers" ("category");

-- ─────────────────────────────────────────────────────────────────────────────
-- Calibration Services
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "calibration_services" (
  "id"            uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"          varchar(500) NOT NULL,
  "industry_slug" varchar(100),
  "city"          varchar(100),
  "price"         varchar(100),
  "accreditation" varchar(255),
  "door_delivery" boolean      DEFAULT false,
  "visit_services" boolean     DEFAULT false,
  "response_time" varchar(100),
  "rating"        numeric(3,1) DEFAULT 0,
  "instruments"   text,
  "is_active"     boolean      DEFAULT true,
  "created_at"    timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "calibration_services_industry_slug_idx" ON "calibration_services" ("industry_slug");

-- ─────────────────────────────────────────────────────────────────────────────
-- Testing Services
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "testing_services" (
  "id"             uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"           varchar(500) NOT NULL,
  "category"       varchar(255),
  "provider"       varchar(255),
  "industry_slug"  varchar(100),
  "price"          varchar(100),
  "turnaround"     varchar(100),
  "city"           varchar(100),
  "rating"         numeric(3,1) DEFAULT 0,
  "certifications" text,
  "test_types"     text,
  "description"    text,
  "is_active"      boolean      DEFAULT true,
  "created_at"     timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "testing_services_industry_slug_idx" ON "testing_services" ("industry_slug");
CREATE INDEX IF NOT EXISTS "testing_services_category_idx"      ON "testing_services" ("category");

-- ─────────────────────────────────────────────────────────────────────────────
-- HR Services
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "hr_services" (
  "id"             uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"           varchar(500) NOT NULL,
  "category"       varchar(100) NOT NULL,
  "industry_slug"  varchar(100),
  "company"        varchar(255),
  "type"           varchar(100),
  "experience"     varchar(100),
  "salary"         varchar(100),
  "city"           varchar(100),
  "rating"         numeric(3,1) DEFAULT 0,
  "skills"         text,
  "description"    text,
  "is_active"      boolean      DEFAULT true,
  "created_at"     timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "hr_services_industry_slug_idx" ON "hr_services" ("industry_slug");
CREATE INDEX IF NOT EXISTS "hr_services_category_idx"      ON "hr_services" ("category");

-- ─────────────────────────────────────────────────────────────────────────────
-- Training Programs
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "training_programs" (
  "id"              uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"            varchar(500) NOT NULL,
  "category"        varchar(255),
  "industry_slug"   varchar(100),
  "provider"        varchar(255),
  "price"           varchar(100),
  "duration"        varchar(100),
  "mode"            varchar(100),
  "city"            varchar(100),
  "rating"          numeric(3,1) DEFAULT 0,
  "capacity"        varchar(100),
  "certification"   varchar(255),
  "skills"          text,
  "description"     text,
  "is_active"       boolean      DEFAULT true,
  "created_at"      timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "training_programs_industry_slug_idx" ON "training_programs" ("industry_slug");
CREATE INDEX IF NOT EXISTS "training_programs_category_idx"      ON "training_programs" ("category");

-- ─────────────────────────────────────────────────────────────────────────────
-- Student Services
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "student_services" (
  "id"             uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"           varchar(500) NOT NULL,
  "category"       varchar(255),
  "industry_slug"  varchar(100),
  "provider"       varchar(255),
  "type"           varchar(100),
  "duration"       varchar(100),
  "stipend"        varchar(100),
  "city"           varchar(100),
  "rating"         numeric(3,1) DEFAULT 0,
  "skills"         text,
  "description"    text,
  "is_active"      boolean      DEFAULT true,
  "created_at"     timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "student_services_industry_slug_idx" ON "student_services" ("industry_slug");

-- ─────────────────────────────────────────────────────────────────────────────
-- Financial Services
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "financial_services" (
  "id"             uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"           varchar(500) NOT NULL,
  "category"       varchar(255),
  "industry_slug"  varchar(100),
  "provider"       varchar(255),
  "type"           varchar(100),
  "interest_rate"  varchar(50),
  "amount"         varchar(100),
  "city"           varchar(100),
  "rating"         numeric(3,1) DEFAULT 0,
  "features"       text,
  "description"    text,
  "is_active"      boolean      DEFAULT true,
  "created_at"     timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "financial_services_industry_slug_idx" ON "financial_services" ("industry_slug");
CREATE INDEX IF NOT EXISTS "financial_services_category_idx"      ON "financial_services" ("category");

-- ─────────────────────────────────────────────────────────────────────────────
-- Suppliers (Raw Material Suppliers by Industry)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "suppliers" (
  "id"                uuid         PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name"              varchar(500) NOT NULL,
  "industry_slug"     varchar(100) NOT NULL,
  "material_category" varchar(255),
  "location"          varchar(255),
  "materials"         text,
  "rating"            numeric(3,1) DEFAULT 0,
  "reviews"           integer      DEFAULT 0,
  "min_order"         varchar(100),
  "price"             varchar(100),
  "certifications"    text,
  "established"       varchar(10),
  "employees"         varchar(50),
  "contact"           varchar(100),
  "is_active"         boolean      DEFAULT true,
  "created_at"        timestamp    DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "suppliers_industry_slug_idx"     ON "suppliers" ("industry_slug");
CREATE INDEX IF NOT EXISTS "suppliers_material_category_idx" ON "suppliers" ("material_category");
