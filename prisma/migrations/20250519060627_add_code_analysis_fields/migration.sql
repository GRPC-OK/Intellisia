/*
  Warnings:

  - Added the required column `hasIssue` to the `CodeAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `CodeAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('pending', 'success', 'fail');

-- AlterTable
ALTER TABLE "CodeAnalysis" ADD COLUMN     "hasIssue" BOOLEAN NOT NULL,
ADD COLUMN     "status" "AnalysisStatus" NOT NULL;
