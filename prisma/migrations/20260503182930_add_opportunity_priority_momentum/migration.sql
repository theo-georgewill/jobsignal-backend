/*
  Warnings:

  - Added the required column `momentum` to the `Opportunity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "momentum" TEXT NOT NULL,
ADD COLUMN     "priority" TEXT NOT NULL;
