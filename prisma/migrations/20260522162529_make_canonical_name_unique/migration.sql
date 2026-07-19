/*
  Warnings:

  - A unique constraint covering the columns `[canonicalName]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_canonicalName_key" ON "Company"("canonicalName");
