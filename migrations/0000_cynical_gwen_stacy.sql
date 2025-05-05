CREATE TABLE "alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"alert_type" text NOT NULL,
	"message" text NOT NULL,
	"blood_type" text,
	"level" text DEFAULT 'info' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "blood_inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"blood_type" text NOT NULL,
	"units" integer DEFAULT 0 NOT NULL,
	"donation_date" timestamp NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"donor_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blood_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"hospital_id" integer NOT NULL,
	"blood_type" text NOT NULL,
	"units" integer NOT NULL,
	"priority" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reason" text,
	"contact_person" text NOT NULL,
	"contact_phone" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"fulfilled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"blood_type" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"gender" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"last_donation_date" timestamp,
	"is_eligible" boolean DEFAULT true NOT NULL,
	"eligibility_reason" text,
	"next_eligible_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"contact_person" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recipients" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"blood_type" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"gender" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"city" text,
	"state" text,
	"zip" text,
	"hospital_id" integer,
	"medical_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_type" text NOT NULL,
	"blood_type" text NOT NULL,
	"units" integer NOT NULL,
	"source" text,
	"destination" text,
	"request_id" integer,
	"notes" text,
	"performed_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
