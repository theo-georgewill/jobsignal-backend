/*
  Warnings:

  - A unique constraint covering the columns `[companyId]` on the table `Opportunity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_companyId_key" ON "Opportunity"("companyId");
