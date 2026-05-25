CREATE SCHEMA IF NOT EXISTS "auth";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "subscription";
--> statement-breakpoint
CREATE TABLE "auth"."superadmins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "superadmins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auth"."tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"subdomain" varchar(100) NOT NULL,
	"database_name" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"plan_id" uuid,
	"country" varchar(2),
	"timezone" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug"),
	CONSTRAINT "tenants_subdomain_unique" UNIQUE("subdomain"),
	CONSTRAINT "tenants_database_name_unique" UNIQUE("database_name")
);
--> statement-breakpoint
CREATE TABLE "subscription"."plan_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"feature_key" varchar(100) NOT NULL,
	"feature_value" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "subscription"."subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"price_monthly" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "global_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "global_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "subscription"."plan_features" ADD CONSTRAINT "plan_features_plan_id_subscriptions_id_fk" FOREIGN KEY ("plan_id") REFERENCES "subscription"."subscriptions"("id") ON DELETE no action ON UPDATE no action;