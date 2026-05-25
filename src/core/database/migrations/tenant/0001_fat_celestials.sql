CREATE TABLE "auth"."refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_lookup_hash" varchar(64) NOT NULL,
	"ciphertext" text NOT NULL,
	"iv" varchar(64) NOT NULL,
	"auth_tag" varchar(64) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_lookup_hash_unique" UNIQUE("token_lookup_hash")
);
--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;