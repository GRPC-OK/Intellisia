import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: '테스트유저',
      email: 'test@example.com',
      avatarUrl: '/avatar.png',
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Test Next.js App',
      description: '테스트용 공개 레포',
      githubUrl: 'https://github.com/JSHWJ/Test-Nextjs-app',
      domain: 'test-app.localhost',
      ownerId: user.id,
    },
  });

  const helm = await prisma.helmValues.create({
    data: {
      content: {
        replicaCount: 1,
        image: {
          repository: 'test-image',
          tag: 'latest',
        },
      },
    },
  });

  await prisma.version.create({
    data: {
      name: 'v0.1.0',
      description: '처음 테스트 버전입니다',
      isCurrent: false,
      branch: 'main',
      commitHash: '', // 아직 없음
      applicationName: 'test-next-app',
      imageTag: '',

      codeStatus: 'none',
      buildStatus: 'none',
      imageStatus: 'none',
      approveStatus: 'none',
      deployStatus: 'none',
      flowStatus: 'none',

      projectId: project.id,
      authorId: user.id,
      helmValuesId: helm.id,
    },
  });
}

main()
  .then(() => {
    console.log('✅ 테스트 데이터 삽입 완료');
  })
  .catch((e) => {
    console.error('❌ 오류:', e);
  })
  .finally(() => {
    prisma.$disconnect();
  });
