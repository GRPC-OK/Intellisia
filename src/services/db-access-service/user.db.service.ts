import prisma from '@/lib/prisma'; // Prisma 클라이언트 인스턴스
import { User, Prisma } from '@prisma/client'; // Prisma에서 생성된 타입들

/**
 * 새로운 사용자를 데이터베이스에 생성합니다.
 * (참고: 현재 "프로젝트 생성" 기능에서는 직접 사용되지 않으나, 향후 사용자 가입 등 기능 확장 시 필요)
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param userData 생성할 사용자 데이터 (Prisma.UserCreateInput 타입)
 * @returns 생성된 User 객체
 * @throws PrismaClientKnownRequestError (예: 이메일 중복 시 P2002) 등 DB 관련 에러
 */
export const createUserInDB = async (
  userData: Prisma.UserCreateInput
): Promise<User> => {
  const newUser = await prisma.user.create({
    data: userData,
  });
  return newUser;
};

/**
 * 주어진 ID로 특정 사용자를 조회합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param userId 조회할 사용자의 ID
 * @param includeRelations (선택적) 함께 로드할 관계 (예: { projects: true })
 * @returns User 객체 또는 null (찾지 못한 경우)
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findUserByIdFromDB = async (
  userId: number,
  includeRelations: { projects?: boolean } = { projects: true }
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: includeRelations.projects ? { projects: true } : undefined,
  });
  return user;
};

/**
 * 주어진 이메일 주소로 특정 사용자를 조회합니다.
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param email 조회할 사용자의 이메일 주소
 * @param includeRelations (선택적) 함께 로드할 관계 (예: { projects: true })
 * @returns User 객체 또는 null (찾지 못한 경우)
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findUserByEmailFromDB = async (
  email: string,
  includeRelations: { projects?: boolean } = { projects: true }
): Promise<User | null> => {
  const user = await prisma.user.findUnique({
    where: { email: email },
    include: includeRelations.projects ? { projects: true } : undefined,
  });
  return user;
};

/**
 * 시스템의 모든 사용자 목록을 조회합니다.
 * (예: 관리자 페이지의 사용자 목록 기능에 사용)
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param options (선택적) 정렬, 페이지네이션, 관계 포함 등의 옵션
 * @returns User 객체의 배열
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능
 */
export const findAllUsersDB = async (
  options?: {
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput; // 필터링 조건 추가
    include?: Prisma.UserInclude;
  }
): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: options?.where,
    orderBy: options?.orderBy || { createdAt: 'desc' }, // 기본 정렬: 최신 가입일 순
    skip: options?.skip,
    take: options?.take,
    include: options?.include,
  });
  return users;
};

/**
 * 특정 사용자의 정보를 업데이트합니다.
 * (참고: 현재 "프로젝트 생성" 기능에서는 직접 사용되지 않으나, 향후 프로필 수정 등 기능 확장 시 필요)
 * 에러 발생 시 호출한 서비스로 에러를 전파합니다.
 * @param userId 업데이트할 사용자의 ID
 * @param updateData 업데이트할 사용자 데이터 (Prisma.UserUpdateInput 타입)
 * @returns 업데이트된 User 객체
 * @throws PrismaClientKnownRequestError 등 DB 관련 에러 발생 가능합니다.
 */
export const updateUserInDB = async (
  userId: number,
  updateData: Prisma.UserUpdateInput
): Promise<User> => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  return updatedUser;
};

// User 모델과 관련된 다른 DB 접근 함수들은 필요에 따라 여기에 추가할 수 있습니다.
// 예: deleteUserFromDB 등