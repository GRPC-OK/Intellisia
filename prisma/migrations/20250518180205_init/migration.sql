/*
  Warnings:

  - Added the required column `versionId` to the `CodeIssue` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CodeIssue" DROP CONSTRAINT "CodeIssue_codeAnalysisId_fkey";

-- AlterTable
ALTER TABLE "CodeIssue" ADD COLUMN     "versionId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "CodeIssue_versionId_idx" ON "CodeIssue"("versionId");

-- CreateIndex
CREATE INDEX "CodeIssue_codeAnalysisId_idx" ON "CodeIssue"("codeAnalysisId");

-- AddForeignKey
ALTER TABLE "CodeIssue" ADD CONSTRAINT "CodeIssue_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeIssue" ADD CONSTRAINT "CodeIssue_codeAnalysisId_fkey" FOREIGN KEY ("codeAnalysisId") REFERENCES "CodeAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
