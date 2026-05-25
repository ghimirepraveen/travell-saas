CREATE SCHEMA IF NOT EXISTS "destinations";
--> statement-breakpoint
CREATE TABLE "destinations"."destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"country" varchar(100),
	"city" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "packages"."travel_packages" ADD COLUMN "destination_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "packages"."travel_packages" ADD CONSTRAINT "travel_packages_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "destinations"."destinations"("id") ON DELETE no action ON UPDATE no action;
