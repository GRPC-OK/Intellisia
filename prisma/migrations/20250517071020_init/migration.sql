-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('none', 'pending', 'success', 'fail');

-- CreateEnum
CREATE TYPE "ApproveStatus" AS ENUM ('none', 'pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "FlowStatus" AS ENUM ('none', 'pending', 'success', 'fail');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "defaultHelmValues" JSONB,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectContributors" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "ProjectContributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "imageTag" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commitHash" TEXT NOT NULL,
    "applicationName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "codeStatus" "StepStatus" NOT NULL DEFAULT 'none',
    "buildStatus" "StepStatus" NOT NULL DEFAULT 'none',
    "imageStatus" "StepStatus" NOT NULL DEFAULT 'none',
    "deployStatus" "StepStatus" NOT NULL DEFAULT 'none',
    "approveStatus" "ApproveStatus" NOT NULL DEFAULT 'none',
    "flowStatus" "FlowStatus" NOT NULL DEFAULT 'none',
    "helmValuesId" INTEGER,
    "projectId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HelmValues" (
    "id" SERIAL NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HelmValues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_domain_key" ON "Project"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectContributors_userId_projectId_key" ON "ProjectContributors"("userId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Version_helmValuesId_key" ON "Version"("helmValuesId");

-- CreateIndex
CREATE UNIQUE INDEX "Version_projectId_name_key" ON "Version"("projectId", "name");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContributors" ADD CONSTRAINT "ProjectContributors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectContributors" ADD CONSTRAINT "ProjectContributors_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_helmValuesId_fkey" FOREIGN KEY ("helmValuesId") REFERENCES "HelmValues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
