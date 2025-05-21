# Node.js 런타임 이미지를 베이스로 생성
FROM node:18-alpine

# 컨테이너 내의 작업 디렉토리를 설정
WORKDIR /app

# package.json과 package-lock.json을 작업 디렉토리에 복사 (분리하여 캐싱 활용)
COPY package*.json ./

# 애플리케이션 의존성 설치 (개발 의존성 포함)
# RUN npm install --omit=dev  # 프로덕션 환경에서는 devDependencies 제외
# --omit=dev 옵션을 사용하면 @prisma/client가 설치되지 않을 수 있어 문제가 생길 수 있으니
# 빌드 단계에서는 모든 의존성을 설치하고, 최종 이미지에서는 필요한 것만 복사
RUN npm install

# Prisma 스키마 파일 복사 (prisma generate를 위해)
# prisma 폴더 안에 schema.prisma 파일이 있다고 가정하고 복사
COPY prisma ./prisma/

# Prisma 클라이언트 및 타입 생성
# 이 스텝이 @prisma/client에 필요한 타입 정의를 생성
RUN npx prisma generate

# 나머지 애플리케이션 코드 복사
COPY . ./

# 애플리케이션 빌드
RUN npm run build

# 앱이 실행될 포트 노출
EXPOSE 3000

# entrypoint.sh 파일 복사 및 실행 권한 부여
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]