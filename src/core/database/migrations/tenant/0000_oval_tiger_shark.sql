CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "packages";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "inventory";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "customers";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "bookings";
--> statement-breakpoint
CREATE TABLE "auth"."permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "permissions_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "auth"."roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(255),
	"role" varchar(50) DEFAULT 'agent' NOT NULL,
	"is_active" varchar(5) DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "packages"."travel_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"description" text,
	"destination" varchar(255),
	"duration_days" integer DEFAULT 1 NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "travel_packages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inventory"."departures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"departure_date" date NOT NULL,
	"total_seats" integer NOT NULL,
	"booked_seats" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers"."customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(30),
	"passport_number" varchar(50),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings"."booking_travelers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings"."bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" varchar(32) NOT NULL,
	"package_id" uuid NOT NULL,
	"departure_id" uuid NOT NULL,
	"travel_date" date NOT NULL,
	"pax_count" integer NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"status" varchar(30) DEFAULT 'pending_payment' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
ALTER TABLE "inventory"."departures" ADD CONSTRAINT "departures_package_id_travel_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "packages"."travel_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings"."booking_travelers" ADD CONSTRAINT "booking_travelers_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings"."booking_travelers" ADD CONSTRAINT "booking_travelers_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings"."bookings" ADD CONSTRAINT "bookings_package_id_travel_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "packages"."travel_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings"."bookings" ADD CONSTRAINT "bookings_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "inventory"."departures"("id") ON DELETE no action ON UPDATE no action;