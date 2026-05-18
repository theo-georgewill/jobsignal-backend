-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('JOB', 'INTERNSHIP', 'GRANT', 'FELLOWSHIP', 'SCHOLARSHIP', 'HACKATHON', 'ACCELERATOR', 'CONTRACT');

-- CreateEnum
CREATE TYPE "OpportunityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "OpportunityMomentum" AS ENUM ('STABLE', 'RISING', 'TRENDING');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "country" TEXT,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "logoUrl" TEXT,
    "careersUrl" TEXT NOT NULL,
    "atsType" TEXT NOT NULL,
    "tags" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "healthy" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" TIMESTAMP(3),
    "crawlError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT true,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT,
    "hash" TEXT NOT NULL,
    "description" TEXT,
    "descriptionHtml" TEXT,
    "workMode" TEXT,
    "employmentType" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "salaryPeriod" TEXT,
    "metadata" JSONB,
    "postedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signal" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT,
    "rawCompanyName" TEXT,
    "companyId" TEXT,
    "url" TEXT,
    "source" TEXT NOT NULL,
    "payload" JSONB,
    "hash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "source" TEXT,
    "externalId" TEXT,
    "hash" TEXT NOT NULL,
    "location" TEXT,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "priority" "OpportunityPriority" NOT NULL DEFAULT 'LOW',
    "momentum" "OpportunityMomentum" NOT NULL DEFAULT 'STABLE',
    "status" "OpportunityStatus" NOT NULL DEFAULT 'ACTIVE',
    "opensAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "externalTitle" TEXT,
    "externalCompany" TEXT,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'saved',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionEngine" (
    "id" TEXT NOT NULL,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "running" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionEngine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "healthy" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "successRate" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT,
    "status" TEXT NOT NULL,
    "fetched" INTEGER NOT NULL DEFAULT 0,
    "saved" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "message" TEXT,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionLog" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "sourceName" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IngestionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Job_hash_key" ON "Job"("hash");

-- CreateIndex
CREATE INDEX "Job_companyId_idx" ON "Job"("companyId");

-- CreateIndex
CREATE INDEX "Job_postedAt_idx" ON "Job"("postedAt");

-- CreateIndex
CREATE INDEX "Job_remote_idx" ON "Job"("remote");

-- CreateIndex
CREATE UNIQUE INDEX "Signal_hash_key" ON "Signal"("hash");

-- CreateIndex
CREATE INDEX "Signal_companyId_idx" ON "Signal"("companyId");

-- CreateIndex
CREATE INDEX "Signal_type_idx" ON "Signal"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_hash_key" ON "Opportunity"("hash");

-- CreateIndex
CREATE INDEX "Opportunity_companyId_idx" ON "Opportunity"("companyId");

-- CreateIndex
CREATE INDEX "Opportunity_type_idx" ON "Opportunity"("type");

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IngestionSource_name_key" ON "IngestionSource"("name");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signal" ADD CONSTRAINT "Signal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
