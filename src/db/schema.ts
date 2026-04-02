import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  numeric,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  emailVerified: boolean("email_verified").default(false),
  mobileVerified: boolean("mobile_verified").default(false),
  isActive: boolean("is_active").default(true),
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

// ─────────────────────────────────────────────────────────────────────────────
// Industries
// ─────────────────────────────────────────────────────────────────────────────
export const industries = pgTable("industries", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIndustrySchema = createInsertSchema(industries).omit({
  id: true,
  createdAt: true,
});

export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type Industry = typeof industries.$inferSelect;

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
