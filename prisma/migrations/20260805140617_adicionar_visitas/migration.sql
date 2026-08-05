-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "source" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "vidHash" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "deviceType" TEXT,
    "deviceBrand" TEXT,
    "locale" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visits_createdAt_idx" ON "visits"("createdAt");

-- CreateIndex
CREATE INDEX "visits_path_idx" ON "visits"("path");

-- CreateIndex
CREATE INDEX "visits_source_idx" ON "visits"("source");
