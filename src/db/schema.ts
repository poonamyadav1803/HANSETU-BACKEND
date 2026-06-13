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
  stateJurisdiction: text("state_jurisdiction"),
  stateJurisdictionCode: varchar("state_jurisdiction_code", { length: 20 }),
  centralJurisdiction: text("central_jurisdiction"),
  centralJurisdictionCode: varchar("central_jurisdiction_code", { length: 20 }),
  dealerType: varchar("dealer_type", { length: 50 }),
  einvoiceStatus: varchar("einvoice_status", { length: 10 }),
  cancellationDate: varchar("cancellation_date", { length: 50 }),
  additionalAddresses: jsonb("additional_addresses"),
  lastUpdatedAtGstn: varchar("last_updated_at_gstn", { length: 50 }),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  rawApiResponse: text("raw_api_response"),
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
  industryId: uuid("industry_id").references(() => industries.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  icon: varchar("icon", { length: 100 }),
  groupName: varchar("group_name", { length: 255 }),
  subcategories: jsonb("subcategories").default([]),
  sortOrder: integer("sort_order").default(0),
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
  industryId: uuid("industry_id").references(() => industries.id, { onDelete: "cascade" }),
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
  manufacturerUserId: uuid("manufacturer_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  industryId: uuid("industry_id").references(() => industries.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "cascade" }),
  subcategoryId: uuid("subcategory_id").references(() => subcategories.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  materialType: varchar("material_type", { length: 255 }),
  grade: varchar("grade", { length: 255 }),
  specifications: jsonb("specifications").default({}),
  moq: integer("moq"),
  leadTime: varchar("lead_time", { length: 100 }),
  price: numeric("price", { precision: 10, scale: 2 }),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  brand: varchar("brand", { length: 255 }),
  samplesAvailable: boolean("samples_available").default(false),
  inStock: boolean("in_stock").default(true),
  rating: numeric("rating", { precision: 3, scale: 1 }).default("0"),
  reviews: integer("reviews").default(0),
  images: jsonb("images"),
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
// Product ↔ Services junction
// ─────────────────────────────────────────────────────────────────────────────
export const productServices = pgTable("product_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // testing | calibration | training
  serviceId: uuid("service_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ProductService = typeof productServices.$inferSelect;

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
// Raw Material Products (material-category-based catalogue)
// ─────────────────────────────────────────────────────────────────────────────
export const rawMaterialProducts = pgTable("raw_material_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  categorySlug: varchar("category_slug", { length: 100 }).notNull(),
  subcategory: varchar("subcategory", { length: 255 }),
  name: varchar("name", { length: 500 }).notNull(),
  grade: varchar("grade", { length: 255 }),
  unit: varchar("unit", { length: 50 }),
  priceMin: numeric("price_min"),
  priceMax: numeric("price_max"),
  specifications: jsonb("specifications"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRawMaterialProductSchema = createInsertSchema(rawMaterialProducts).omit({
  id: true,
  createdAt: true,
});

export type InsertRawMaterialProduct = z.infer<typeof insertRawMaterialProductSchema>;
export type RawMaterialProduct = typeof rawMaterialProducts.$inferSelect;

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

// ─────────────────────────────────────────────────────────────────────────────
// Admin Users (separate from business users)
// ─────────────────────────────────────────────────────────────────────────────
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type AdminUser = typeof adminUsers.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Admin Invitations
// ─────────────────────────────────────────────────────────────────────────────
export const adminInvitations = pgTable("admin_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  token: varchar("token", { length: 500 }).unique().notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending | accepted | expired
  invitedBy: uuid("invited_by").notNull().references(() => adminUsers.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type AdminInvitation = typeof adminInvitations.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Raw Material Orders (placed by manufacturer users)
// ─────────────────────────────────────────────────────────────────────────────
export const rawMaterialOrders = pgTable("raw_material_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  manufacturerUserId: uuid("manufacturer_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  materialName: varchar("material_name", { length: 500 }).notNull(),
  supplierName: varchar("supplier_name", { length: 500 }).notNull(),
  quantity: varchar("quantity", { length: 100 }).notNull(),
  price: varchar("price", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending | accepted | problem_reported
  problemDescription: text("problem_description"),
  orderDate: date("order_date").notNull(),
  city: varchar("city", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRawMaterialOrderSchema = createInsertSchema(rawMaterialOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRawMaterialOrder = z.infer<typeof insertRawMaterialOrderSchema>;
export type RawMaterialOrder = typeof rawMaterialOrders.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Supplier Inventory (managed by supplier users)
// ─────────────────────────────────────────────────────────────────────────────
export const supplierInventory = pgTable("supplier_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierUserId: uuid("supplier_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  materialName: varchar("material_name", { length: 500 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  quantity: varchar("quantity", { length: 100 }).notNull(),
  price: varchar("price", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("available").notNull(), // available | low_stock | out_of_stock
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupplierInventorySchema = createInsertSchema(supplierInventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplierInventory = z.infer<typeof insertSupplierInventorySchema>;
export type SupplierInventoryItem = typeof supplierInventory.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Supplier Transactions (sales by supplier users)
// ─────────────────────────────────────────────────────────────────────────────
export const supplierTransactions = pgTable("supplier_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierUserId: uuid("supplier_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  buyerName: varchar("buyer_name", { length: 500 }).notNull(),
  materialName: varchar("material_name", { length: 500 }).notNull(),
  amount: varchar("amount", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // paid | pending | overdue
  transactionDate: date("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupplierTransactionSchema = createInsertSchema(supplierTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSupplierTransaction = z.infer<typeof insertSupplierTransactionSchema>;
export type SupplierTransaction = typeof supplierTransactions.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Manufacturer Industries (seed-driven catalog)
// ─────────────────────────────────────────────────────────────────────────────
export const mfrIndustries = pgTable("mfr_industries", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g. "automobile"
  name: varchar("name", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  icon: varchar("icon", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 50 }),
  description: text("description"),
  certifications: jsonb("certifications").default([]).notNull(),
  routePath: varchar("route_path", { length: 200 }).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MfrIndustry = typeof mfrIndustries.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Manufacturer Categories (per industry, seed-driven)
// ─────────────────────────────────────────────────────────────────────────────
export const mfrCategories = pgTable("mfr_categories", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g. "auto-engine"
  industryId: varchar("industry_id", { length: 100 })
    .notNull()
    .references(() => mfrIndustries.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  subcategories: jsonb("subcategories").default([]).notNull(),
  materials: jsonb("materials").default([]).notNull(),
  certifications: jsonb("certifications").default([]).notNull(),
  tolerances: jsonb("tolerances").default([]).notNull(),
  surfaceFinishes: jsonb("surface_finishes").default([]).notNull(),
  dimensionTemplate: jsonb("dimension_template").default({}).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MfrCategory = typeof mfrCategories.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Manufacturer Products (seed-driven catalog)
// ─────────────────────────────────────────────────────────────────────────────
export const mfrProducts = pgTable("mfr_products", {
  id: varchar("id", { length: 100 }).primaryKey(), // e.g. "prod-auto-piston-al"
  industryId: varchar("industry_id", { length: 100 })
    .notNull()
    .references(() => mfrIndustries.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id", { length: 100 })
    .notNull()
    .references(() => mfrCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  subcategory: varchar("subcategory", { length: 500 }),
  description: text("description"),
  grade: varchar("grade", { length: 255 }),
  unit: varchar("unit", { length: 50 }).default("pc").notNull(),
  priceMin: numeric("price_min", { precision: 14, scale: 2 }).notNull(),
  priceMax: numeric("price_max", { precision: 14, scale: 2 }).notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  certifications: jsonb("certifications").default([]).notNull(),
  specifications: jsonb("specifications").default({}).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MfrProduct = typeof mfrProducts.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// User Addresses (shipping / billing)
// ─────────────────────────────────────────────────────────────────────────────
export const userAddresses = pgTable("user_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 100 }).notNull(), // e.g. "Office", "Factory"
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  line1: varchar("line1", { length: 500 }).notNull(),
  line2: varchar("line2", { length: 500 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserAddressSchema = createInsertSchema(userAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserAddress = z.infer<typeof insertUserAddressSchema>;
export type UserAddress = typeof userAddresses.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Auto Orders (manufacturer product orders via Hansetu merchant model)
// ─────────────────────────────────────────────────────────────────────────────
export const autoOrders = pgTable("auto_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // Spec form data (from the matching form)
  partName: varchar("part_name", { length: 500 }).notNull(),
  industrySlug: varchar("industry_slug", { length: 100 }).notNull(),
  categoryId: varchar("category_id", { length: 100 }),
  subcategory: varchar("subcategory", { length: 500 }),
  material: varchar("material", { length: 255 }),
  quantity: varchar("quantity", { length: 100 }),
  orderType: varchar("order_type", { length: 50 }).notNull(), // sample | bulk | both | annual-contract
  certifications: jsonb("certifications").default([]).notNull(),
  deliveryState: varchar("delivery_state", { length: 100 }),
  leadTime: varchar("lead_time", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  notes: text("notes"),
  // Optionally ordered specific catalog product
  mfrProductId: varchar("mfr_product_id", { length: 100 }).references(() => mfrProducts.id, { onDelete: "set null" }),
  productQuantity: integer("product_quantity").default(1),
  // Delivery address
  addressId: uuid("address_id").references(() => userAddresses.id, { onDelete: "set null" }),
  // Payment / status
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 50 }), // upi | card | netbanking | wallet
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending").notNull(), // pending | paid | failed
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending | confirmed | processing | dispatched | delivered | cancelled
  orderNumber: varchar("order_number", { length: 30 }).unique(),
  notes2: text("notes2"), // internal notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAutoOrderSchema = createInsertSchema(autoOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAutoOrder = z.infer<typeof insertAutoOrderSchema>;
export type AutoOrder = typeof autoOrders.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// RFQ Requests (buyer submits a request for quotation)
// ─────────────────────────────────────────────────────────────────────────────
export const rfqRequests = pgTable("rfq_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  rfqNumber: varchar("rfq_number", { length: 50 }).unique().notNull(),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productName: varchar("product_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  quantity: numeric("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).default("units").notNull(),
  deliveryLocation: text("delivery_location").notNull(),
  requiredBy: varchar("required_by", { length: 100 }),
  specs: text("specs"),
  orderType: varchar("order_type", { length: 20 }).default("BULK").notNull(),   // SAMPLE | BULK
  requestType: varchar("request_type", { length: 50 }).default("PRODUCT_CATALOGUE").notNull(),
  // PRODUCT_CATALOGUE | COMPONENT_MANUFACTURER
  attachments: jsonb("attachments").default([]),                               // string[] of S3 URLs
  status: varchar("status", { length: 50 }).default("SUBMITTED").notNull(),
  // SUBMITTED | UNDER_REVIEW | PO_RAISED | DISPATCHED | DELIVERED | CLOSED | CANCELLED
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRfqRequestSchema = createInsertSchema(rfqRequests).omit({
  id: true,
  rfqNumber: true,
  status: true,
  attachments: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRfqRequest = z.infer<typeof insertRfqRequestSchema>;
export type RfqRequest = typeof rfqRequests.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// RFQ Assignments (admin assigns a supplier + sets opening price)
// ─────────────────────────────────────────────────────────────────────────────
export const rfqAssignments = pgTable("rfq_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  rfqId: uuid("rfq_id")
    .unique()
    .notNull()
    .references(() => rfqRequests.id, { onDelete: "cascade" }),
  supplierUserId: uuid("supplier_user_id")
    .notNull()
    .references(() => users.id),
  assignedBy: uuid("assigned_by").notNull(), // adminUsers.id
  adminMarginPct: numeric("admin_margin_pct").default("10").notNull(),
  negotiatedPrice: numeric("negotiated_price"),
  finalAgreedPrice: numeric("final_agreed_price"),
  negotiationStatus: varchar("negotiation_status", { length: 50 })
    .default("PENDING")
    .notNull(),
  // PENDING | SUPPLIER_QUOTED | APPROVED | REJECTED
  internalNotes: text("internal_notes"),
  approvedAt: timestamp("approved_at"),
  // Supplier quote fields (Story 3.2–3.3)
  supplierQuotedPrice: numeric("supplier_quoted_price"),
  supplierLeadTimeDays: integer("supplier_lead_time_days"),
  supplierMoq: numeric("supplier_moq"),
  quoteValidityDate: varchar("quote_validity_date", { length: 50 }),
  supplierNotes: text("supplier_notes"),
  quoteSubmittedAt: timestamp("quote_submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type RfqAssignment = typeof rfqAssignments.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// RFQ Negotiations (one row per negotiation round — full history)
// ─────────────────────────────────────────────────────────────────────────────
export const rfqNegotiations = pgTable("rfq_negotiations", {
  id: uuid("id").primaryKey().defaultRandom(),
  rfqId: uuid("rfq_id")
    .notNull()
    .references(() => rfqRequests.id, { onDelete: "cascade" }),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => rfqAssignments.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  offeredBy: varchar("offered_by", { length: 20 }).notNull(), // ADMIN | SUPPLIER
  offeredById: uuid("offered_by_id").notNull(),
  offeredPrice: numeric("offered_price").notNull(),
  leadTimeDays: integer("lead_time_days"),
  validityDays: integer("validity_days"),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  // PENDING | ACCEPTED | COUNTERED | REJECTED
  createdAt: timestamp("created_at").defaultNow(),
});

export type RfqNegotiation = typeof rfqNegotiations.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Orders (confirmed buyer orders created from accepted RFQ quote/sample)
// ─────────────────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 50 }).unique().notNull(),
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rfqId: uuid("rfq_id")
    .unique()
    .notNull()
    .references(() => rfqRequests.id, { onDelete: "restrict" }),
  assignmentId: uuid("assignment_id").references(() => rfqAssignments.id, { onDelete: "set null" }),
  sourceType: varchar("source_type", { length: 30 }).notNull(), // ACCEPTED_QUOTE | SAMPLE
  status: varchar("status", { length: 50 }).default("ORDER_CONFIRMED").notNull(),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }),
  advancePaymentAmount: numeric("advance_payment_amount", { precision: 14, scale: 2 }),
  advancePaymentMethod: varchar("advance_payment_method", { length: 50 }),
  advancePaymentReference: varchar("advance_payment_reference", { length: 255 }),
  advancePaymentStatus: varchar("advance_payment_status", { length: 50 }).default("NOT_APPLICABLE").notNull(),
  phase5DocumentStatus: varchar("phase5_document_status", { length: 50 }).default("TRIGGERED").notNull(),
  phase5DocumentGenerationTriggeredAt: timestamp("phase5_document_generation_triggered_at").defaultNow(),
  phase5Documents: jsonb("phase5_documents").default([]).notNull(),
  supplierAcknowledgedAt: timestamp("supplier_acknowledged_at"),
  expectedDispatchDate: date("expected_dispatch_date"),
  supplierCertificateFiles: jsonb("supplier_certificate_files").default([]).notNull(),
  supplierAcknowledgementNotes: text("supplier_acknowledgement_notes"),
  notes: text("notes"),
  confirmedAt: timestamp("confirmed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  status: true,
  phase5DocumentStatus: true,
  phase5DocumentGenerationTriggeredAt: true,
  phase5Documents: true,
  confirmedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Purchase Orders (platform → supplier; supplier price, no margin shown)
// ─────────────────────────────────────────────────────────────────────────────
export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  poNumber: varchar("po_number", { length: 50 }).unique().notNull(),
  rfqId: uuid("rfq_id")
    .notNull()
    .references(() => rfqRequests.id, { onDelete: "restrict" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  supplierUserId: uuid("supplier_user_id")
    .notNull()
    .references(() => users.id),
  buyerUserId: uuid("buyer_user_id")
    .notNull()
    .references(() => users.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: numeric("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).default("units").notNull(),
  baseAmount: numeric("base_amount", { precision: 14, scale: 2 }).notNull(),
  gstAmount: numeric("gst_amount", { precision: 14, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  hsnCode: varchar("hsn_code", { length: 20 }),
  deliveryLocation: text("delivery_location"),
  terms: text("terms"),
  status: varchar("status", { length: 50 }).default("ISSUED").notNull(),
  // ISSUED | CONFIRMED | INVOICE_UPLOADED | DISPATCHED | DELIVERED | CLOSED
  supplierInvoiceNo: varchar("supplier_invoice_no", { length: 100 }),
  supplierInvoiceAmount: numeric("supplier_invoice_amount", { precision: 14, scale: 2 }),
  ewayBillNo: varchar("eway_bill_no", { length: 50 }),
  acknowledgedAt: timestamp("acknowledged_at"),
  expectedDispatchDate: varchar("expected_dispatch_date", { length: 50 }),
  qcDocuments: jsonb("qc_documents").default([]), // string[] of S3 URLs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Sales Invoices (platform → buyer; includes margin)
// ─────────────────────────────────────────────────────────────────────────────
export const salesInvoices = pgTable("sales_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  rfqId: uuid("rfq_id")
    .notNull()
    .references(() => rfqRequests.id, { onDelete: "restrict" }),
  poId: uuid("po_id").references(() => purchaseOrders.id, { onDelete: "set null" }),
  buyerUserId: uuid("buyer_user_id")
    .notNull()
    .references(() => users.id),
  productName: varchar("product_name", { length: 255 }).notNull(),
  quantity: numeric("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).default("units").notNull(),
  baseAmount: numeric("base_amount", { precision: 14, scale: 2 }).notNull(),
  marginAmount: numeric("margin_amount", { precision: 14, scale: 2 }).notNull(),
  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default("18").notNull(),
  gstAmount: numeric("gst_amount", { precision: 14, scale: 2 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  hsnCode: varchar("hsn_code", { length: 20 }),
  ewayBillNo: varchar("eway_bill_no", { length: 50 }),
  deliveryLocation: text("delivery_location"),
  status: varchar("status", { length: 30 }).default("ISSUED").notNull(),
  // ISSUED | PAID | CANCELLED
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type SalesInvoice = typeof salesInvoices.$inferSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Shipments (created by supplier after uploading invoice)
// ─────────────────────────────────────────────────────────────────────────────
export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  shipmentNumber: varchar("shipment_number", { length: 50 }).unique().notNull(),
  poId: uuid("po_id").notNull().references(() => purchaseOrders.id, { onDelete: "restrict" }),
  rfqId: uuid("rfq_id").notNull().references(() => rfqRequests.id, { onDelete: "restrict" }),
  buyerId: uuid("buyer_id").notNull().references(() => users.id),
  supplierId: uuid("supplier_id").notNull().references(() => users.id),
  transporterName: varchar("transporter_name", { length: 255 }),
  docketNumber: varchar("docket_number", { length: 100 }),
  dispatchDate: varchar("dispatch_date", { length: 50 }),
  ewayBillNo: varchar("eway_bill_no", { length: 50 }),
  status: varchar("status", { length: 50 }).default("DISPATCHED").notNull(),
  // DISPATCHED | IN_TRANSIT | OUT_FOR_DELIVERY | DELIVERED | RECEIVED
  checkpoints: jsonb("checkpoints").default([]).notNull(),
  // [{ label, location, note, ts }]
  deliveredAt: timestamp("delivered_at"),
  receivedByBuyerAt: timestamp("received_by_buyer_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Shipment = typeof shipments.$inferSelect;
