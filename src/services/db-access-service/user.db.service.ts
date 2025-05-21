import prisma from '@/lib/prisma';
import { User } from '@prisma/client';

/**
 * 주어진 ID로 특정 사용자를 조회합니다.
 * 프로젝트 생성 시 소유자(owner)의 존재를 확인하는 데 사용됩니다.
 * 에러 발생 시 호출한 상위 서비스로 에러를 전파합니다.
 * @param userId 조회할 사용자의 ID
 * @returns User 객체 또는 null (사용자를 찾지 못한 경우)
 */
export const findUserByIdFromDB = async (
  userId: number
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
};