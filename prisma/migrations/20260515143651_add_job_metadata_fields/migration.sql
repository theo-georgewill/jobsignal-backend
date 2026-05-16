-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "salaryCurrency" TEXT DEFAULT 'USD',
ADD COLUMN     "salaryMax" INTEGER,
ADD COLUMN     "salaryMin" INTEGER,
ADD COLUMN     "salaryPeriod" TEXT,
ADD COLUMN     "workMode" TEXT;
