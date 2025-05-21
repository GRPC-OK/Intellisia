import prisma from '@/lib/prisma'; // Prisma Client 인스턴스 import
import { User, Prisma } from '@prisma/client'; // Prisma에서 생성된 User 타입 및 Prisma 네임스페이스 import

/**
 * 주어진 ID로 특정 사용자를 조회합니다.
 * 에러 발생 시 호출한 상위 서비스로 에러를 전파합니다.
 * @param userId 조회할 사용자의 ID (숫자)
 * @param includeRelations (선택적) 함께 로드할 관계형 데이터 (예: 사용자가 생성한 프로젝트 목록)
 * @returns User 객체 또는 null (사용자를 찾지 못한 경우)
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findUserById = async (
  userId: number,
  includeRelations?: Prisma.UserInclude // 관계형 데이터를 포함하기 위한 타입
): Promise<User | null> => {
  // try...catch 블록 제거, 에러는 상위로 전파됨
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: includeRelations, // 예: { projects: true }
  });
  return user;
};

/**
 * 주어진 이메일 주소로 특정 사용자를 조회합니다.
 * 에러 발생 시 호출한 상위 서비스로 에러를 전파합니다.
 * @param email 조회할 사용자의 이메일 주소 (문자열)
 * @returns User 객체 또는 null (사용자를 찾지 못한 경우)
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  // try...catch 블록 제거, 에러는 상위로 전파됨
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return user;
};

// createUser 및 updateUser 함수는 현재 요구사항에서 제외되었습니다.
// 향후 사용자 가입, 프로필 수정 등의 기능이 필요할 때 추가할 수 있습니다.