ALTER TABLE "packages"."travel_packages" ADD COLUMN "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "packages"."travel_packages" ADD COLUMN "priority" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "packages"."travel_packages" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;