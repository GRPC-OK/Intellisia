-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "StepStatus" AS ENUM ('none', 'pending', 'success', 'fail');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "Version" ADD COLUMN "imageAnalysisStatus" "StepStatus";
ALTER TABLE "Version" ADD COLUMN "imageAnalysisS3Url" TEXT;
