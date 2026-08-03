-- CreateTable
CREATE TABLE "platforms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortLabel" TEXT,
    "badgeKey" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platforms_slug_key" ON "platforms"("slug");

-- SeedPlatforms
INSERT INTO "platforms" ("id", "name", "slug", "shortLabel", "badgeKey", "status", "createdAt", "updatedAt") VALUES
    ('cm0plat000000000001', 'Mercado Livre', 'mercado-livre', 'ML', 'yellow', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cm0plat000000000002', 'Shopee', 'shopee', 'SP', 'orange', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cm0plat000000000003', 'Hotmart', 'hotmart', 'HM', 'blue', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cm0plat000000000004', 'Outro', 'outro', 'OU', 'gray', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable
ALTER TABLE "products" ADD COLUMN "platformId" TEXT;

-- BackfillProducts
UPDATE "products" SET "platformId" = CASE "platform"
    WHEN 'MERCADO_LIVRE' THEN 'cm0plat000000000001'
    WHEN 'SHOPEE' THEN 'cm0plat000000000002'
    WHEN 'HOTMART' THEN 'cm0plat000000000003'
    ELSE 'cm0plat000000000004'
END;

ALTER TABLE "products" ALTER COLUMN "platformId" SET NOT NULL;

-- AlterClicks
ALTER TABLE "clicks" ALTER COLUMN "platform" TYPE TEXT USING "platform"::text;

UPDATE "clicks" SET "platform" = CASE "platform"
    WHEN 'MERCADO_LIVRE' THEN 'mercado-livre'
    WHEN 'SHOPEE' THEN 'shopee'
    WHEN 'HOTMART' THEN 'hotmart'
    ELSE 'outro'
END;

-- DropOldColumnsAndType
ALTER TABLE "products" DROP COLUMN "platform";

DROP TYPE "Platform";

-- CreateIndex
CREATE INDEX "products_platformId_idx" ON "products"("platformId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "platforms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
