// prisma/seed.ts

import {
  PrismaClient,
  StepStatus,
  ApproveStatus,
  FlowStatus,
  AnalysisStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. 유저 생성
  const user = await prisma.user.create({
    data: {
      name: '테스트유저',
      email: 'test@example.com',
      avatarUrl: '/avatar.png',
    },
  });

  // 2. 프로젝트 생성
  const project = await prisma.project.create({
    data: {
      name: 'Test Project',
      description: 'Flow 테스트용 프로젝트',
      githubUrl: 'https://github.com/example/test-project',
      domain: 'test-project.localhost',
      ownerId: user.id,
    },
  });

  // 3. HelmValues 생성
  const helm = await prisma.helmValues.create({
    data: {
      content: {
        replicaCount: 2,
        image: {
          repository: 'example/image',
          tag: 'v1.0.0',
        },
      },
    },
  });

  // 4. Version 생성 (모든 status 값 포함)
  const version = await prisma.version.create({
    data: {
      name: 'v1.0.0',
      description: '정적 분석 및 빌드 완료 테스트 버전',
      isCurrent: true,
      imageTag: 'v1.0.0',
      branch: 'main',
      commitHash: 'abc123def456',
      applicationName: 'test-app',

      codeStatus: StepStatus.success,
      buildStatus: StepStatus.success,
      imageStatus: StepStatus.success,
      approveStatus: ApproveStatus.pending,
      deployStatus: StepStatus.none,
      flowStatus: FlowStatus.pending,

      authorId: user.id,
      projectId: project.id,
      helmValuesId: helm.id,
    },
  });

  // 5. CodeAnalysis + CodeIssue 생성
  await prisma.codeAnalysis.create({
    data: {
      versionId: version.id,
      hasIssue: true,
      status: AnalysisStatus.success,
      errorLog: null,
      issues: {
        create: [
          {
            ruleId: 'SEC-001',
            message: 'XSS 취약점이 발견되었습니다.',
            severity: 'HIGH',
            filePath: 'src/pages/index.tsx',
            line: 21,
            column: 10,
            versionId: version.id,
          },
          {
            ruleId: 'SEC-002',
            message: '취약한 의존성이 발견되었습니다.',
            severity: 'MEDIUM',
            filePath: 'package.json',
            line: 12,
            versionId: version.id,
          },
        ],
      },
    },
  });

  console.log('✅ VersionFlowPage 테스트용 시드 완료');
}

main()
  .catch((e) => {
    console.error('❌ 시드 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
