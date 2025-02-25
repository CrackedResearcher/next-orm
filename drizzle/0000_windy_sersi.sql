CREATE TABLE "userFiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_uploaded_at" time DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "userData" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"createdAt" time DEFAULT now(),
	CONSTRAINT "userData_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "userFiles" ADD CONSTRAINT "userFiles_user_id_userData_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."userData"("id") ON DELETE cascade ON UPDATE cascade;