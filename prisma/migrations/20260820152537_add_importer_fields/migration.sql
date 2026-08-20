-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('MANUAL', 'IMPORTED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sourceType" "SourceType" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "product_import_logs" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "platform" TEXT,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "extractionMethod" TEXT,
    "confidence" DOUBLE PRECISION,
    "result" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_import_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_cache" (
    "id" TEXT NOT NULL,
    "urlHash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "import_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_import_logs_status_idx" ON "product_import_logs"("status");

-- CreateIndex
CREATE INDEX "product_import_logs_createdAt_idx" ON "product_import_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "import_cache_urlHash_key" ON "import_cache"("urlHash");

-- CreateIndex
CREATE INDEX "import_cache_urlHash_idx" ON "import_cache"("urlHash");

-- CreateIndex
CREATE INDEX "import_cache_expiresAt_idx" ON "import_cache"("expiresAt");

-- CreateIndex
CREATE INDEX "products_sourceType_idx" ON "products"("sourceType");
