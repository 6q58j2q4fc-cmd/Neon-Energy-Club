import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pre-orders table for NEON energy drink relaunch.
 * Stores customer information and order details.
 */
export const preorders = mysqlTable("preorders", {
  id: int("id").autoincrement().primaryKey(),
  /** Customer full name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Customer email address */
  email: varchar("email", { length: 320 }).notNull(),
  /** Customer phone number (optional) */
  phone: varchar("phone", { length: 50 }),
  /** Number of cases to pre-order (each case contains 24 cans) */
  quantity: int("quantity").notNull(),
  /** Delivery address */
  address: text("address").notNull(),
  /** City */
  city: varchar("city", { length: 100 }).notNull(),
  /** State/Province */
  state: varchar("state", { length: 100 }).notNull(),
  /** Postal/ZIP code */
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  /** Country */
  country: varchar("country", { length: 100 }).notNull().default("USA"),
  /** Order status */
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  /** Additional notes from customer */
  notes: text("notes"),
  /** Order creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Preorder = typeof preorders.$inferSelect;
export type InsertPreorder = typeof preorders.$inferInsert;