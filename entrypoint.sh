#!/bin/sh
set -e

# DB 마이그레이션
if [ -f "package.json" ] && grep -q prisma package.json; then
  npx prisma migrate deploy
else
  echo "Prisma not found, skipping migration."
fi

# 앱 시작
npm start
