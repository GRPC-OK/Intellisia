/*
  Warnings:

  - The values [success,fail] on the enum `AnalysisStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `errorLog` on the `CodeAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `hasIssue` on the `CodeAnalysis` table. All the data in the column will be lost.
  - You are about to drop the `CodeIssue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sunwoo` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AnalysisStatus_new" AS ENUM ('pending', 'failed', 'passed_with_issues', 'passed_no_issues');
ALTER TABLE "CodeAnalysis" ALTER COLUMN "status" TYPE "AnalysisStatus_new" USING ("status"::text::"AnalysisStatus_new");
ALTER TYPE "AnalysisStatus" RENAME TO "AnalysisStatus_old";
ALTER TYPE "AnalysisStatus_new" RENAME TO "AnalysisStatus";
DROP TYPE "AnalysisStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "CodeIssue" DROP CONSTRAINT "CodeIssue_codeAnalysisId_fkey";

-- DropForeignKey
ALTER TABLE "CodeIssue" DROP CONSTRAINT "CodeIssue_versionId_fkey";

-- AlterTable
ALTER TABLE "CodeAnalysis" DROP COLUMN "errorLog",
DROP COLUMN "hasIssue",
ADD COLUMN     "errorLogUrl" TEXT,
ADD COLUMN     "sarifUrl" TEXT;

-- AlterTable
ALTER TABLE "Version" ALTER COLUMN "commitHash" DROP NOT NULL;

-- DropTable
DROP TABLE "CodeIssue";

-- DropTable
DROP TABLE "sunwoo";
