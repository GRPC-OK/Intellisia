import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 유저 생성
  const user = await prisma.user.create({
    data: {
      name: '테스트유저',
      email: 'test@example.com',
      avatarUrl: '/avatar.png',
    },
  });

  // 프로젝트 생성
  const project = await prisma.project.create({
    data: {
      name: '테스트 프로젝트',
      description: '설명입니다',
      githubUrl: 'https://github.com/test/test',
      domain: 'test.localhost',
      ownerId: user.id,
    },
  });

  // 헬름 값
  const helm = await prisma.helmValues.create({
    data: {
      content: { replicaCount: 1 },
    },
  });

  // 버전 생성
  await prisma.version.create({
    data: {
      name: 'v1.0.0',
      description: '테스트 버전입니다',
      isCurrent: true,
      branch: 'main',
      commitHash: 'abcdef123456',
      applicationName: 'test-app',
      imageTag: 'test-image:1.0.0',
      codeStatus: 'success',
      buildStatus: 'success',
      imageStatus: 'pending',
      approveStatus: 'none',
      deployStatus: 'none',
      flowStatus: 'pending',
      projectId: project.id,
      authorId: user.id,
      helmValuesId: helm.id,
    },
  });
}

main()
  .then(() => {
    console.log('Seed 완료');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
