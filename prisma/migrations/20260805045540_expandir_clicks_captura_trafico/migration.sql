-- AlterTable
ALTER TABLE "clicks" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "deviceBrand" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "ipHash" TEXT,
ADD COLUMN     "locale" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "pageUrl" TEXT,
ADD COLUMN     "referrer" TEXT,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "utmCampaign" TEXT,
ADD COLUMN     "utmContent" TEXT,
ADD COLUMN     "utmMedium" TEXT,
ADD COLUMN     "utmTerm" TEXT;

-- CreateIndex
CREATE INDEX "clicks_source_idx" ON "clicks"("source");
