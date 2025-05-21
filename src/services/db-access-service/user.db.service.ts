// src/services/db-access-service/user.db.service.ts

import prisma from '@/lib/prisma'; // Prisma 클라이언트 인스턴스 import
import { User, Prisma } from '@prisma/client'; // Prisma에서 생성된 User 타입 및 기타 타입 import

/**
 * 주어진 ID로 특정 사용자를 조회합니다.
 * @param userId 조회할 사용자의 ID (숫자)
 * @param includeRelations (선택적) 함께 로드할 관계형 데이터 (예: 사용자가 생성한 프로젝트 목록)
 * @returns User 객체 또는 null (사용자를 찾지 못한 경우)
 * @throws Error 데이터베이스 조회 중 에러 발생 시
 */
export const findUserById = async (
  userId: number,
  includeRelations?: Prisma.UserInclude // 관계형 데이터를 포함하기 위한 타입
): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: includeRelations, // 예: { projects: true }
    });
    return user;
  } catch (error) {
    console.error(`Error finding user with ID ${userId}:`, error);
    // 실제 프로덕션에서는 더 정교한 에러 로깅 및 처리가 필요합니다.
    // 예를 들어, 에러를 그대로 다시 던지거나, 특정 커스텀 에러 타입으로 감싸서 던질 수 있습니다.
    throw new Error(`Failed to find user with ID ${userId}.`);
  }
};

/**
 * 주어진 이메일 주소로 특정 사용자를 조회합니다.
 * @param email 조회할 사용자의 이메일 주소 (문자열)
 * @returns User 객체 또는 null (사용자를 찾지 못한 경우)
 * @throws Error 데이터베이스 조회 중 에러 발생 시
 */
export const findUserByEmail = async (
  email: string
): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  } catch (error) {
    console.error(`Error finding user with email ${email}:`, error);
    throw new Error(`Failed to find user with email ${email}.`);
  }
};

/**
 * 새로운 사용자를 데이터베이스에 생성합니다.
 * (프로젝트 생성과는 별개일 수 있지만, 일반적인 User DB 서비스 기능으로 추가)
 * @param userData 생성할 사용자 데이터 (Prisma.UserCreateInput 타입)
 * @returns 생성된 User 객체
 * @throws Error 데이터베이스 생성 중 에러 발생 시 (예: 이메일 중복)
 */
export const createUser = async (
  userData: Prisma.UserCreateInput
): Promise<User> => {
  try {
    const newUser = await prisma.user.create({
      data: userData,
    });
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    // PrismaClientKnownRequestError를 사용하여 P2002 (유니크 제약 조건 위반) 등의 특정 에러 처리 가능
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('A user with this email already exists.');
    }
    throw new Error('Failed to create user.');
  }
};

/**
 * 특정 사용자의 정보를 업데이트합니다.
 * @param userId 업데이트할 사용자의 ID
 * @param updateData 업데이트할 사용자 데이터 (Prisma.UserUpdateInput 타입)
 * @returns 업데이트된 User 객체
 * @throws Error 업데이트 중 에러 발생 시
 */
export const updateUser = async (
  userId: number,
  updateData: Prisma.UserUpdateInput
): Promise<User> => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw new Error(`Failed to update user with ID ${userId}.`);
  }
};

// 필요에 따라 다른 User 관련 DB 접근 함수들을 추가할 수 있습니다.
// 예: deleteUser, findManyUsers 등