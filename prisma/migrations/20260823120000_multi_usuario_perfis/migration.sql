-- Multi-usuário: role USER, username único e posse de produtos

-- CreateEnumValue
ALTER TYPE "Role" ADD VALUE 'USER';

-- Users.username (backfill a partir da parte local do e-mail, com dedup)
ALTER TABLE "users" ADD COLUMN "username" TEXT;

UPDATE "users" SET "username" = lower(regexp_replace(split_part("email", '@', 1), '[^a-z0-9-]', '-', 'g'));

UPDATE "users" u
SET "username" = u."username" || '-' || substr(u."id", greatest(length(u."id") - 3, 1))
FROM "users" other
WHERE u."username" = other."username" AND u."id" > other."id";

ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL;
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- Products.userId (backfill: produtos existentes pertencem ao admin mais antigo)
ALTER TABLE "products" ADD COLUMN "userId" TEXT;

UPDATE "products"
SET "userId" = (
  SELECT u."id" FROM "users" u WHERE u."role" = 'ADMIN' ORDER BY u."createdAt" ASC LIMIT 1
);

ALTER TABLE "products" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "products" ADD CONSTRAINT "products_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "products_userId_idx" ON "products"("userId");
