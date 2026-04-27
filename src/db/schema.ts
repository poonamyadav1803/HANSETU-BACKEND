import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
  jsonb,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const otpTable = pgTable("otp", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  gstNumber: varchar("gst_number", { length: 20 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  mobile: varchar("mobile", { length: 15 }).unique().notNull(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  password: text("password").notNull(),
  businessType: varchar("business_type", { length: 50 }).notNull(),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  emailVerified: boolean("email_verified").default(false),
  mobileVerified: boolean("mobile_verified").default(false),
  isActive: boolean("is_active").default(true),
  registrationComplete: boolean("registration_complete").default(false).notNull(),
  profile: jsonb("profile"),
  profileCompletedAt: timestamp("profile_completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const wizardBusinessServices = pgTable("wizard_business_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WizardBusinessService = typeof wizardBusinessServices.$inferSelect;

export const wizardRawMaterialCategories = pgTable("wizard_raw_material_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  subcategories: jsonb("subcategories").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WizardRawMaterialCategory = typeof wizardRawMaterialCategories.$inferSelect;

export const wizardIndustryRawMaterialMap = pgTable("wizard_industry_raw_material_map", {
  id: uuid("id").primaryKey().defaultRandom(),
  industrySlug: varchar("industry_slug", { length: 100 }).unique().notNull(),
  rawCategorySlugs: jsonb("raw_category_slugs").default([]).notNull(),
  emoji: varchar("emoji", { length: 50 }),
  sampleTags: jsonb("sample_tags").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WizardIndustryRawMaterialMap = typeof wizardIndustryRawMaterialMap.$inferSelect;

export const wizardManufacturingCapabilities = pgTable("wizard_manufacturing_capabilities", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0).notNull(),
  parameters: jsonb("parameters").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WizardManufacturingCapability = typeof wizardManufacturingCapabilities.$inferSelect;

export const wizardManufacturingProductCategories = pgTable("wizard_manufacturing_product_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  industrySlug: varchar("industry_slug", { length: 100 }).unique().notNull(),
  categories: jsonb("categories").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WizardManufacturingProductCategory = typeof wizardManufacturingProductCategories.$inferSelect;

export const wizardIndustryCategories = pgTable("wizard_industry_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  industrySlug: varchar("industry_slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  emoji: varchar("emoji", { length: 50 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  categories: jsonb("categories").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WizardIndustryCategory = typeof wizardIndustryCategories.$inferSelect;

export const wizardIndustryPartsFilters = pgTable("wizard_industry_parts_filters", {
  id: uuid("id").primaryKey().defaultRandom(),
  industrySlug: varchar("industry_slug", { length: 100 }).unique().notNull(),
  item: jsonb("item").default([]).notNull(),
  grade: jsonb("grade").default([]).notNull(),
  shape: jsonb("shape").default([]).notNull(),
  fabrication: jsonb("fabrication").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type WizardIndustryPartsFilter = typeof wizardIndustryPartsFilters.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// RBAC — Roles
// ─────────────────────────────────────────────────────────────────────────────
export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Role = typeof roles.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// RBAC — Permissions
// ─────────────────────────────────────────────────────────────────────────────
export const permissions = pgTable("permissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).unique().notNull(), // e.g. "users:read"
  resource: varchar("resource", { length: 50 }).notNull(),   // e.g. "users"
  action: varchar("action", { length: 50 }).notNull(),        // e.g. "read"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Permission = typeof permissions.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// RBAC — Role → Permission mapping
// ─────────────────────────────────────────────────────────────────────────────
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);

export type RolePermission = typeof rolePermissions.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// GST Info (cache for Masters India API results)
// ─────────────────────────────────────────────────────────────────────────────
export const gstInfo = pgTable("gst_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  gstNumber: varchar("gst_number", { length: 20 }).unique().notNull(),
  legalName: varchar("legal_name", { length: 500 }),
  tradeName: varchar("trade_name", { length: 500 }),
  registrationStatus: varchar("registration_status", { length: 100 }),
  dateOfRegistration: varchar("date_of_registration", { length: 50 }),
  constitutionOfBusiness: varchar("constitution_of_business", { length: 255 }),
  principalPlaceOfBusiness: text("principal_place_of_business"),
  natureOfBusinessActivities: text("nature_of_business_activities"),
  rawApiResponse: text("raw_api_response"),
  stateJurisdiction: text("state_jurisdiction"),
  stateJurisdictionCode: varchar("state_jurisdiction_code", { length: 10 }),
  dealerType: varchar("dealer_type", { length: 50 }),
  cancellationDate: date("cancellation_date"),
  additionalAddresses: jsonb("additional_addresses"),
  lastUpdatedAtGstn: date("last_updated_at_gstn"),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type GstInfo = typeof gstInfo.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Industries
// ─────────────────────────────────────────────────────────────────────────────
export const industries = pgTable("industries", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 500 }),
  icon: varchar("icon", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  createdAt: true,
});

export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;

export const navRawMaterialCategories = pgTable("nav_raw_material_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 100 }),
  groupName: varchar("group_name", { length: 255 }).notNull(),
  subcategories: jsonb("subcategories").default([]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type NavRawMaterialCategory = typeof navRawMaterialCategories.$inferSelect;

export const customProducts = pgTable("custom_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryType: varchar("category_type", { length: 50 }).notNull(),
  parentSlug: varchar("parent_slug", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 150 }).notNull(),
  metadata: jsonb("metadata").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type CustomProduct = typeof customProducts.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Categories
// ─────────────────────────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // Tailwind class strings stored so frontend can reconstruct theming
  primaryColor: varchar("primary_color", { length: 200 }),
  secondaryColor: varchar("secondary_color", { length: 200 }),
  gradientColor: varchar("gradient_color", { length: 200 }),
  badgeColor: varchar("badge_color", { length: 200 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Subcategories
// ─────────────────────────────────────────────────────────────────────────────
export const subcategories = pgTable("subcategories", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubcategorySchema = createInsertSchema(subcategories).omit({
  id: true,
  createdAt: true,
});

export type InsertSubcategory = z.infer<typeof insertSubcategorySchema>;
export type Subcategory = typeof subcategories.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  subcategoryId: uuid("subcategory_id").references(() => subcategories.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 500 }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  reviews: integer("reviews").default(0),
  brand: varchar("brand", { length: 255 }),
  inStock: boolean("in_stock").default(true),
  specs: text("specs"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Manufacturers
// ─────────────────────────────────────────────────────────────────────────────
export const manufacturers = pgTable("manufacturers", {
  id: uuid("id").primaryKey().defaultRandom(),
  industrySlug: varchar("industry_slug", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  totalEmployees: varchar("total_employees", { length: 50 }),
  turnover: varchar("turnover", { length: 100 }),
  yearEstablished: varchar("year_established", { length: 10 }),
  certifications: text("certifications"), // JSON array stored as text
  inHouseTesting: boolean("in_house_testing").default(false),
  importExport: boolean("import_export").default(false),
  responseTime: varchar("response_time", { length: 50 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  machineCapabilities: text("machine_capabilities"), // JSON array stored as text
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertManufacturerSchema = createInsertSchema(manufacturers).omit({
  id: true,
  createdAt: true,
});

export type InsertManufacturer = z.infer<typeof insertManufacturerSchema>;
export type Manufacturer = typeof manufacturers.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Raw Materials
// ─────────────────────────────────────────────────────────────────────────────
export const rawMaterials = pgTable("raw_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  industrySlug: varchar("industry_slug", { length: 100 }).notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 255 }),
  price: varchar("price", { length: 100 }).notNull(), // e.g. "₹285/kg"
  grade: varchar("grade", { length: 255 }),
  city: varchar("city", { length: 100 }),
  imported: boolean("imported").default(false),
  creditAvailable: boolean("credit_available").default(false),
  quantity: varchar("quantity", { length: 100 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  description: text("description"),
  specifications: text("specifications"), // JSON stored as text
  certification: varchar("certification", { length: 255 }),
  deliveryTime: varchar("delivery_time", { length: 100 }),
  minOrder: varchar("min_order", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRawMaterialSchema = createInsertSchema(rawMaterials).omit({
  id: true,
  createdAt: true,
});

export type InsertRawMaterial = z.infer<typeof insertRawMaterialSchema>;
export type RawMaterial = typeof rawMaterials.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Machines
// ─────────────────────────────────────────────────────────────────────────────
export const machines = pgTable("machines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  type: varchar("type", { length: 255 }),
  location: varchar("location", { length: 100 }),
  price: varchar("price", { length: 100 }).notNull(), // e.g. "$45,000"
  specs: text("specs"),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMachineSchema = createInsertSchema(machines).omit({
  id: true,
  createdAt: true,
});

export type InsertMachine = z.infer<typeof insertMachineSchema>;
export type Machine = typeof machines.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Offers
// ─────────────────────────────────────────────────────────────────────────────
export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  discount: varchar("discount", { length: 20 }).notNull(), // e.g. "25%"
  timeRemaining: varchar("time_remaining", { length: 100 }),
  category: varchar("category", { length: 255 }),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
});

export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Calibration Services
// ─────────────────────────────────────────────────────────────────────────────
export const calibrationServices = pgTable("calibration_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  industrySlug: varchar("industry_slug", { length: 100 }),
  city: varchar("city", { length: 100 }),
  price: varchar("price", { length: 100 }),
  accreditation: varchar("accreditation", { length: 255 }),
  doorDelivery: boolean("door_delivery").default(false),
  visitServices: boolean("visit_services").default(false),
  responseTime: varchar("response_time", { length: 100 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  instruments: text("instruments"), // JSON array
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCalibrationServiceSchema = createInsertSchema(calibrationServices).omit({ id: true, createdAt: true });
export type InsertCalibrationService = z.infer<typeof insertCalibrationServiceSchema>;
export type CalibrationService = typeof calibrationServices.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Testing Services
// ─────────────────────────────────────────────────────────────────────────────
export const testingServices = pgTable("testing_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 255 }),
  provider: varchar("provider", { length: 255 }),
  industrySlug: varchar("industry_slug", { length: 100 }),
  price: varchar("price", { length: 100 }),
  turnaround: varchar("turnaround", { length: 100 }),
  city: varchar("city", { length: 100 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  certifications: text("certifications"), // JSON array
  testTypes: text("test_types"), // JSON array
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestingServiceSchema = createInsertSchema(testingServices).omit({ id: true, createdAt: true });
export type InsertTestingService = z.infer<typeof insertTestingServiceSchema>;
export type TestingService = typeof testingServices.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// HR Services
// ─────────────────────────────────────────────────────────────────────────────
export const hrServices = pgTable("hr_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  industrySlug: varchar("industry_slug", { length: 100 }),
  company: varchar("company", { length: 255 }),
  type: varchar("type", { length: 100 }),
  experience: varchar("experience", { length: 100 }),
  salary: varchar("salary", { length: 100 }),
  city: varchar("city", { length: 100 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  skills: text("skills"), // JSON array
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHrServiceSchema = createInsertSchema(hrServices).omit({ id: true, createdAt: true });
export type InsertHrService = z.infer<typeof insertHrServiceSchema>;
export type HrService = typeof hrServices.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Training Programs
// ─────────────────────────────────────────────────────────────────────────────
export const trainingPrograms = pgTable("training_programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 255 }),
  industrySlug: varchar("industry_slug", { length: 100 }),
  provider: varchar("provider", { length: 255 }),
  price: varchar("price", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  mode: varchar("mode", { length: 100 }),
  city: varchar("city", { length: 100 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  capacity: varchar("capacity", { length: 100 }),
  certification: varchar("certification", { length: 255 }),
  skills: text("skills"), // JSON array
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({ id: true, createdAt: true });
export type InsertTrainingProgram = z.infer<typeof insertTrainingProgramSchema>;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Student Services
// ─────────────────────────────────────────────────────────────────────────────
export const studentServices = pgTable("student_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 255 }),
  industrySlug: varchar("industry_slug", { length: 100 }),
  provider: varchar("provider", { length: 255 }),
  type: varchar("type", { length: 100 }),
  duration: varchar("duration", { length: 100 }),
  stipend: varchar("stipend", { length: 100 }),
  city: varchar("city", { length: 100 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  skills: text("skills"), // JSON array
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentServiceSchema = createInsertSchema(studentServices).omit({ id: true, createdAt: true });
export type InsertStudentService = z.infer<typeof insertStudentServiceSchema>;
export type StudentService = typeof studentServices.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Financial Services
// ─────────────────────────────────────────────────────────────────────────────
export const financialServices = pgTable("financial_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 255 }),
  industrySlug: varchar("industry_slug", { length: 100 }),
  provider: varchar("provider", { length: 255 }),
  type: varchar("type", { length: 100 }),
  interestRate: varchar("interest_rate", { length: 50 }),
  amount: varchar("amount", { length: 100 }),
  city: varchar("city", { length: 100 }),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  features: text("features"), // JSON array
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFinancialServiceSchema = createInsertSchema(financialServices).omit({ id: true, createdAt: true });
export type InsertFinancialService = z.infer<typeof insertFinancialServiceSchema>;
export type FinancialService = typeof financialServices.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Suppliers (Raw Material Suppliers by Industry)
// ─────────────────────────────────────────────────────────────────────────────
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 500 }).notNull(),
  industrySlug: varchar("industry_slug", { length: 100 }).notNull(),
  materialCategory: varchar("material_category", { length: 255 }),
  location: varchar("location", { length: 255 }),
  materials: text("materials"), // JSON array
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  reviews: integer("reviews").default(0),
  minOrder: varchar("min_order", { length: 100 }),
  price: varchar("price", { length: 100 }),
  certifications: text("certifications"), // JSON array
  established: varchar("established", { length: 10 }),
  employees: varchar("employees", { length: 50 }),
  contact: varchar("contact", { length: 100 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
