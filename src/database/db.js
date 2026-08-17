import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
  })
  : new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

// Initialize database tables if not created yet
pool.query(`
  CREATE TABLE IF NOT EXISTS "public"."idea_likes" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
    "idea_id" uuid NOT NULL REFERENCES "public"."ideas"("id") ON DELETE CASCADE,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "idea_likes_unique" UNIQUE ("user_id", "idea_id"),
    PRIMARY KEY ("id")
  );
`).catch((err) => {
  console.error("Error creating idea_likes table:", err.message);
});

export default pool;
