-- DropIndex
DROP INDEX "Company_name_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "canonicalName" TEXT,
ADD COLUMN     "resolutionConfidence" DOUBLE PRECISION,
ADD COLUMN     "resolutionSource" TEXT,
ADD COLUMN     "resolutionStatus" TEXT DEFAULT 'pending',
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "websiteStatusCode" INTEGER,
ADD COLUMN     "websiteValidatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CompanyAlias" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyResolutionAttempt" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "attemptedUrl" TEXT,
    "confidence" DOUBLE PRECISION,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "signals" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,

    CONSTRAINT "CompanyResolutionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyBenchmark" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "expectedWebsite" TEXT NOT NULL,
    "expectedAts" TEXT,
    "expectedCareers" BOOLEAN,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyAlias_normalized_idx" ON "CompanyAlias"("normalized");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAlias_companyId_normalized_key" ON "CompanyAlias"("companyId", "normalized");

-- CreateIndex
CREATE INDEX "CompanyResolutionAttempt_companyName_idx" ON "CompanyResolutionAttempt"("companyName");

-- CreateIndex
CREATE INDEX "CompanyResolutionAttempt_matched_idx" ON "CompanyResolutionAttempt"("matched");

-- AddForeignKey
ALTER TABLE "CompanyAlias" ADD CONSTRAINT "CompanyAlias_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyResolutionAttempt" ADD CONSTRAINT "CompanyResolutionAttempt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
