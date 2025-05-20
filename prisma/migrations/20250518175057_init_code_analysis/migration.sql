-- CreateTable
CREATE TABLE "CodeAnalysis" (
    "id" SERIAL NOT NULL,
    "versionId" INTEGER NOT NULL,
    "errorLog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeIssue" (
    "id" SERIAL NOT NULL,
    "codeAnalysisId" INTEGER NOT NULL,
    "ruleId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT,
    "filePath" TEXT NOT NULL,
    "line" INTEGER NOT NULL,
    "column" INTEGER,

    CONSTRAINT "CodeIssue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeAnalysis_versionId_key" ON "CodeAnalysis"("versionId");

-- AddForeignKey
ALTER TABLE "CodeAnalysis" ADD CONSTRAINT "CodeAnalysis_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "Version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeIssue" ADD CONSTRAINT "CodeIssue_codeAnalysisId_fkey" FOREIGN KEY ("codeAnalysisId") REFERENCES "CodeAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
