import { pgTable, text, serial, integer, timestamp, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Blood types enum
export const bloodTypeEnum = z.enum([
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
]);
export type BloodType = z.infer<typeof bloodTypeEnum>;

// Request priority enum
export const requestPriorityEnum = z.enum([
  "standard", "urgent", "emergency"
]);
export type RequestPriority = z.infer<typeof requestPriorityEnum>;

// Request status enum
export const requestStatusEnum = z.enum([
  "pending", "approved", "rejected", "fulfilled", "cancelled"
]);
export type RequestStatus = z.infer<typeof requestStatusEnum>;

// Transaction type enum
export const transactionTypeEnum = z.enum([
  "donation", "distribution", "transfer", "disposal", "other"
]);
export type TransactionType = z.infer<typeof transactionTypeEnum>;

// Alert type enum
export const alertTypeEnum = z.enum([
  "critical_shortage", "expiring_soon", "new_request", "donation_needed"
]);
export type AlertType = z.infer<typeof alertTypeEnum>;

// User role enum
export const userRoleEnum = z.enum([
  "admin", "staff", "hospital", "donor"
]);
export type UserRole = z.infer<typeof userRoleEnum>;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull().$type<UserRole>(),
  created_at: timestamp("created_at").defaultNow(),
});

// Hospitals table
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  contact_person: text("contact_person"),
  status: text("status").notNull().default("active"),
  created_at: timestamp("created_at").defaultNow(),
});

// Donors table
export const donors = pgTable("donors", {
  id: serial("id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  blood_type: text("blood_type").notNull().$type<BloodType>(),
  date_of_birth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  last_donation_date: timestamp("last_donation_date"),
  is_eligible: boolean("is_eligible").notNull().default(true),
  eligibility_reason: text("eligibility_reason"),
  next_eligible_date: timestamp("next_eligible_date"),
  created_at: timestamp("created_at").defaultNow(),
});

// Recipients table
export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  blood_type: text("blood_type").notNull().$type<BloodType>(),
  date_of_birth: timestamp("date_of_birth").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  hospital_id: integer("hospital_id"),
  medical_notes: text("medical_notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Blood inventory table
export const bloodInventory = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  blood_type: text("blood_type").notNull().$type<BloodType>(),
  units: integer("units").notNull().default(0),
  donation_date: timestamp("donation_date").notNull(),
  expiry_date: timestamp("expiry_date").notNull(),
  status: text("status").notNull().default("available"), // available, reserved, expired, discarded
  donor_id: integer("donor_id"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Blood requests table
export const bloodRequests = pgTable("blood_requests", {
  id: serial("id").primaryKey(),
  hospital_id: integer("hospital_id").notNull(),
  blood_type: text("blood_type").notNull().$type<BloodType>(),
  units: integer("units").notNull(),
  priority: text("priority").notNull().$type<RequestPriority>(),
  status: text("status").notNull().$type<RequestStatus>().default("pending"),
  reason: text("reason"),
  contact_person: text("contact_person").notNull(),
  contact_phone: text("contact_phone").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  fulfilled_at: timestamp("fulfilled_at"),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transaction_type: text("transaction_type").notNull().$type<TransactionType>(),
  blood_type: text("blood_type").notNull().$type<BloodType>(),
  units: integer("units").notNull(),
  source: text("source"),  // donor_id, hospital_id or inventory_id
  destination: text("destination"), // recipient_id, hospital_id or inventory_id
  request_id: integer("request_id"),
  notes: text("notes"),
  performed_by: integer("performed_by").notNull(), // user_id
  created_at: timestamp("created_at").defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  alert_type: text("alert_type").notNull().$type<AlertType>(),
  message: text("message").notNull(),
  blood_type: text("blood_type").$type<BloodType>(),
  level: text("level").notNull().default("info"), // info, warning, critical
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at").defaultNow(),
  expires_at: timestamp("expires_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });
export const insertHospitalSchema = createInsertSchema(hospitals).omit({ id: true, created_at: true });
export const insertDonorSchema = createInsertSchema(donors).omit({ id: true, created_at: true });
export const insertRecipientSchema = createInsertSchema(recipients).omit({ id: true, created_at: true });
export const insertBloodInventorySchema = createInsertSchema(bloodInventory).omit({ id: true, created_at: true, updated_at: true });
export const insertBloodRequestSchema = createInsertSchema(bloodRequests).omit({ id: true, created_at: true, updated_at: true, fulfilled_at: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, created_at: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, created_at: true });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;

export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;

export type Recipient = typeof recipients.$inferSelect;
export type InsertRecipient = z.infer<typeof insertRecipientSchema>;

export type BloodInventoryItem = typeof bloodInventory.$inferSelect;
export type InsertBloodInventoryItem = z.infer<typeof insertBloodInventorySchema>;

export type BloodRequest = typeof bloodRequests.$inferSelect;
export type InsertBloodRequest = z.infer<typeof insertBloodRequestSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Blood type summary (aggregated data for dashboard)
export type BloodTypeSummary = {
  bloodType: BloodType;
  units: number;
  percentage: number;
  expiringUnits: number;
  expiringDays: number;
  isCritical: boolean;
};

// Stats summary for dashboard
export type StatsSummary = {
  totalDonations: number;
  hospitalsServed: number;
  activeDonors: number;
  pendingRequests: number;
};

// Recent activity item
export type RecentActivity = {
  id: number;
  type: "donation" | "request" | "alert" | "expiry";
  title: string;
  description: string;
  time: string;
  timestamp: Date;
  iconColor: string;
  icon: string;
};
