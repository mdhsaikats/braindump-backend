DROP TABLE IF EXISTS "public"."users";
-- Table Definition
CREATE TABLE "public"."users" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "username" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "password_hash" text NOT NULL,
    "bio" text,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("id")
);


-- Indices
CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

DROP TABLE IF EXISTS "public"."ideas";
-- Table Definition
CREATE TABLE "public"."ideas" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid,
    "title" varchar(255),
    "description" text,
    "likes" int4 DEFAULT 0,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ideas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."saves";
-- Table Definition
CREATE TABLE "public"."saves" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid,
    "idea_id" uuid,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saves_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "saves_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE,
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."tags";
-- Table Definition
CREATE TABLE "public"."tags" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "idea_id" uuid,
    "user_id" uuid,
    "tags" varchar(100),
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "public"."ideas"("id") ON DELETE CASCADE,
    CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    PRIMARY KEY ("id")
);

INSERT INTO "public"."users" ("id", "username", "email", "password_hash", "bio", "created_at") VALUES
('57bfb76a-11ed-40ec-9976-16bc8c4ec685', 'mdhsaikats', 'saikatsikder2911@gmail.com', '$2b$12$UpeG3.qC7wjvbhif4uBveOCz/kf4./hiT69.7eG18QArbmTc3VDmW', NULL, '2026-08-14 16:24:57.943642');



