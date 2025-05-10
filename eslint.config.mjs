// eslint.config.mjs
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// __dirname 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 호환 설정
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

// Next.js 공식 ESLint 설정 확장
const eslintConfig = [...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier')];

export default eslintConfig;
