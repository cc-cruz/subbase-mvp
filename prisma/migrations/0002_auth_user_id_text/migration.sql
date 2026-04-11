ALTER TABLE "users"
ALTER COLUMN "auth_user_id" TYPE TEXT
USING "auth_user_id"::text;
