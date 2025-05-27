import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: '테스트 사용자',
      email: 'test@example.com',
      avatarUrl: 'https://i.pravatar.cc/150?u=test@example.com',
    },
  });

  const project = await prisma.project.upsert({
    where: { name: '샘플 프로젝트' },
    update: {},
    create: {
      name: '샘플 프로젝트',
      description: '정적 분석 테스트용 프로젝트',
      githubUrl: 'https://github.com/sample/repo',
      domain: 'sample.com',
      ownerId: user.id,
    },
  });

  const version = await prisma.version.create({
    data: {
      name: 'v1.0.0',
      description: '테스트 버전입니다',
      imageTag: 'v1.0.0',
      branch: 'main',
      commitHash: 'abc123',
      isCurrent: true,
      authorId: user.id,
      projectId: project.id,
      codeStatus: 'success',
      buildStatus: 'success',
      imageStatus: 'success',
      deployStatus: 'none',
      approveStatus: 'none',
      flowStatus: 'success',
    },
  });

  await prisma.codeAnalysis.create({
    data: {
      versionId: version.id,
      status: 'passed_with_issues',
      sarifUrl: '/full.sarif',
      errorLogUrl: null,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
