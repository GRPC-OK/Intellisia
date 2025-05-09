// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

// 현재 파일의 디렉토리 경로를 가져옵니다.
// FlatCompat이 기준 디렉토리를 찾기 위해 필요합니다.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 이전 .eslintrc.* 형식의 설정을 새 Flat Config 형식으로 변환하기 위한 호환성 레이어입니다.
// Next.js와 같은 공유 설정을 사용하기 위해 필요합니다.
const compat = new FlatCompat({
  baseDirectory: __dirname, // 이 설정 파일이 있는 디렉토리를 기준으로 사용
  resolvePluginsRelativeTo: __dirname, // 플러그인도 이 디렉토리를 기준으로 해결
});

// Next.js의 권장 설정들을 확장하여 사용합니다.
// "next/core-web-vitals": 웹 바이탈 관련 핵심 규칙 포함
// "next/typescript": Next.js 프로젝트를 위한 TypeScript 관련 규칙 포함
const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript"
    // 필요하다면 여기에 다른 설정이나 플러그인을 추가할 수 있습니다.
    // 예: "eslint:recommended", "plugin:react/recommended" 등 (Next.js 설정에 포함되어 있을 수도 있음)
    // 예: ...compat.extends("eslint:recommended"),
    // 예: { files: ["**/*.test.{js,jsx,ts,tsx}"], plugins: { jest: jestPlugin }, rules: jestPlugin.configs.recommended.rules },
  ),

  // 필요하다면 여기에 프로젝트 고유의 사용자 정의 규칙을 추가할 수 있습니다.
  // 예: {
  //   rules: {
  //     "no-console": "warn",
  //     "react/react-in-jsx-scope": "off", // Next.js에서는 필요 없을 수 있습니다.
  //   },
  // },

  // 만약 Prettier와 함께 사용한다면 eslint-config-prettier 설정을 추가해야 합니다.
  // 예: ...compat.extends("prettier"),
];

// 구성된 ESLint 설정을 내보냅니다.
export default eslintConfig;