// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스 생성 (시딩 스크립트 내에서 사용)
const prisma = new PrismaClient();

// 비동기 시딩 함수 정의
async function main() {
  console.log('Start seeding ...'); // 시딩 시작 로그

  // 기존 Project 데이터 삭제 (선택 사항, 개발 환경에서만 사용 권장)
  // 시딩을 여러 번 실행할 때 중복 데이터를 방지합니다.
  await prisma.project.deleteMany();
  console.log('Deleted existing project data');

  // 다양한 상태, 동기화 상태, 헬스 상태를 위한 배열
  const statuses = ['approved', 'pending', 'failed'];
  const syncStates = ['Synced', 'OutOfSync'];
  const healthStates = ['Healthy', 'Degraded', 'Missing'];
  const logMessages = ['배포 성공', '승인 대기', '배포 실패', '스캔 완료', '빌드 중'];

  // Project 1부터 Project 10까지 10개의 예시 프로젝트 생성
  for (let i = 1; i <= 10; i++) {
    const projectName = `Project ${i}`;

    // 나머지 필드 값은 반복문을 활용하여 다양하게 설정
    const projectStatus = statuses[i % statuses.length]; // 상태 다양화
    const projectSync = syncStates[i % syncStates.length]; // 동기화 상태 다양화
    const projectHealth = healthStates[i % healthStates.length]; // 헬스 상태 다양화
    const projectLog = `${new Date().toISOString().slice(0, 19).replace('T', ' ')} ${logMessages[i % logMessages.length]}`; // 최근 로그 다양화

    // Prisma 클라이언트의 create 메서드를 사용하여 DB에 새로운 Project 레코드 생성
    await prisma.project.create({
      data: {
        name: projectName,
        path: `acme-ai/project-${i}`, // 예시 경로
        size: `${(Math.random() * 5 + 1).toFixed(1)}MB`, // 1.0MB ~ 6.0MB 사이의 랜덤 크기
        icon: `https://cdn-icons-png.flaticon.com/512/1055/${1055687 + (i % 3)}.png`, // 아이콘 URL 다양화 (예시)
        status: projectStatus,
        sync: projectSync,
        health: projectHealth,
        lastLog: projectLog,
        // createdAt, updatedAt 필드는 @default(now()), @updatedAt 설정에 따라 자동으로 채워집니다.
      },
    });
    console.log(`Created project: ${projectName}`); // 프로젝트 생성 로그
  }

  console.log('Seeding finished.'); // 시딩 종료 로그
}

// 시딩 함수 실행 및 오류 처리
main()
  .catch((e) => {
    console.error('Error during seeding:', e); // 오류 발생 시 에러 로그
    process.exit(1); // 프로세스 종료
  })
  .finally(async () => {
    await prisma.$disconnect(); // Prisma 클라이언트 연결 해제
  });
