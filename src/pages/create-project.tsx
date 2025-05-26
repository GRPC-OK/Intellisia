// src/pages/create-project.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

// --- 상수 정의 ---
/**
 * 프로젝트가 생성될 기본 도메인입니다.
 * 예: 'my-app.BASE_DOMAIN' 형태로 사용됩니다.
 */
const BASE_DOMAIN = 'intellisia.app'; // 실제 운영 환경에 맞게 수정하세요.

/**
 * 프로젝트 생성 성공 후 프로젝트 페이지로 리디렉션하기 전 대기 시간 (밀리초 단위)
 */
const REDIRECT_DELAY_MS = 2000;

// --- 타입 정의 ---

/**
 * 폼 입력 값들의 타입을 정의합니다.
 */
interface FormData {
  projectName: string; // 사용자가 입력하는 프로젝트 이름
  description: string; // 프로젝트에 대한 설명
  githubUrl: string; // 프로젝트의 GitHub 저장소 URL
  derivedDomain: string; // 프로젝트 이름을 기반으로 자동 생성되는 전체 도메인 (UI 표시용)
  helmReplicaCount: string; // Helm 차트의 레플리카 수 (문자열로 입력받음)
  containerPort: string; // 컨테이너가 리스닝하는 포트 (문자열로 입력받음)
}

/**
 * 폼 필드별 에러 메시지 및 API 에러 메시지 타입을 정의합니다.
 */
interface FormErrors {
  projectName?: string;
  description?: string; // 현재는 description 필드에 대한 유효성 검사가 없지만, 확장성을 위해 포함
  githubUrl?: string;
  helmReplicaCount?: string;
  containerPort?: string;
  apiError?: string; // API 호출 관련 에러 메시지
}

// --- 유틸리티 함수 ---

/**
 * 프로젝트 이름을 URL 친화적인 슬러그(slug) 형태로 변환합니다.
 * @param name 변환할 프로젝트 이름 문자열
 * @returns URL 슬러그 형태의 문자열
 */
const slugifyProjectName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase() // 소문자로 변환
    .trim() // 양쪽 공백 제거
    .replace(/\s+/g, '-') // 공백 문자를 하이픈(-)으로 대체
    .replace(/[^\w-]+/g, '') // 영숫자, 밑줄(_), 하이픈(-) 외의 모든 문자 제거
    .replace(/--+/g, '-'); // 연속된 하이픈을 하나로 축약
};

// --- React 컴포넌트 ---

const ProjectCreationForm: React.FC = () => {
  const router = useRouter();

  // --- 상태 관리 (State) ---
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    githubUrl: '',
    derivedDomain: `.${BASE_DOMAIN}`, // 초기값은 '.BASE_DOMAIN'
    helmReplicaCount: '1', // 기본 레플리카 수
    containerPort: '8080', // 기본 컨테이너 포트
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // --- 효과 (Effects) ---

  /**
   * `formData.projectName`이 변경될 때마다 `derivedDomain`을 자동으로 업데이트합니다.
   * `BASE_DOMAIN`도 의존성 배열에 포함하여, 혹시라도 BASE_DOMAIN이 동적으로 변경될 가능성에 대비합니다.
   */
  useEffect(() => {
    const slug = slugifyProjectName(formData.projectName);
    setFormData(prevData => ({
      ...prevData,
      derivedDomain: slug ? `${slug}.${BASE_DOMAIN}` : `.${BASE_DOMAIN}`,
    }));
  }, [formData.projectName]); // BASE_DOMAIN은 상수로 선언되어 변경되지 않으므로, 의존성 배열에서 제외해도 무방합니다.


  // --- 이벤트 핸들러 및 유효성 검사 ---

  /**
   * 입력 필드 값 변경 시 호출되는 핸들러입니다.
   * formData를 업데이트하고, 해당 필드의 에러 메시지와 API 에러 메시지를 초기화합니다.
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));

      // 입력이 변경되면 해당 필드의 에러 메시지를 우선 제거
      if (errors[name as keyof FormErrors]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
      }
      // API 에러 메시지도 사용자가 수정을 시작하면 제거하여 혼란을 줄임
      if (errors.apiError) {
        setErrors(prevErrors => ({ ...prevErrors, apiError: undefined }));
      }
      // 성공 메시지도 초기화
      setSuccessMessage('');
    },
    [errors] // errors 객체가 변경될 때 함수를 재생성하도록 하여 최신 에러 상태를 참조
  );

  /**
   * 폼 제출 전 입력 값들의 유효성을 검사합니다.
   * @returns 유효성 검사 통과 여부 (true: 통과, false: 실패)
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 1. 프로젝트 이름 유효성 검사
    if (!formData.projectName.trim()) {
      newErrors.projectName = '프로젝트 이름은 필수입니다.';
      isValid = false;
    } else if (slugifyProjectName(formData.projectName).length === 0) {
      newErrors.projectName =
        '프로젝트 이름은 URL 친화적인 유효한 문자를 포함해야 합니다.';
      isValid = false;
    }

    // 2. GitHub 저장소 URL 유효성 검사
    if (!formData.githubUrl.trim()) {
      newErrors.githubUrl = 'GitHub 저장소 주소는 필수입니다.';
      isValid = false;
    } else {
      try {
        const url = new URL(formData.githubUrl);
        // GitHub URL은 https 프로토콜이어야 하고, github.com 도메인을 포함해야 하며, .git으로 끝나야 함
        if (
          url.protocol !== 'https:' ||
          !url.hostname.includes('github.com') ||
          !url.pathname.endsWith('.git')
        ) {
          newErrors.githubUrl =
            '올바른 GitHub 저장소 URL 형식이 아닙니다 (예: https://github.com/OWNER/REPO.git).';
          isValid = false;
        }
      } catch {
        newErrors.githubUrl = '올바른 URL 형식이 아닙니다.';
        isValid = false;
      }
    }

    // 3. Helm 레플리카 수 유효성 검사
    const replicaCount = parseInt(formData.helmReplicaCount, 10);
    if (isNaN(replicaCount) || replicaCount < 0) {
      newErrors.helmReplicaCount = '레플리카 수는 0 이상의 정수여야 합니다.';
      isValid = false;
    }

    // 4. 컨테이너 포트 유효성 검사
    const port = parseInt(formData.containerPort, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      newErrors.containerPort =
        '유효한 포트 번호(1-65535)를 입력해주세요.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * 폼 제출 시 호출되는 핸들러입니다.
   * 유효성 검사, API 호출, 결과에 따른 UI 업데이트 및 페이지 이동을 처리합니다.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    setSuccessMessage(''); // 이전 성공 메시지 초기화
    setErrors(prevErrors => ({ ...prevErrors, apiError: undefined })); // 이전 API 에러 초기화

    // 프론트엔드 유효성 검사 실행
    if (!validateForm()) {
      return; // 유효성 검사 실패 시 중단
    }

    setIsLoading(true); // 로딩 상태 시작

    // API로 전송할 derivedDomain은 BASE_DOMAIN을 제외한 순수 slug 값이어야 합니다.
    const slugForApi = slugifyProjectName(formData.projectName);
    // 이 시점에서 slugForApi는 validateForm을 통과했으므로 유효한 값이라고 가정할 수 있지만,
    // 방어적으로 한 번 더 확인합니다.
    if (!slugForApi) {
      setErrors(prevErrors => ({ ...prevErrors, projectName: '유효한 프로젝트 이름으로 도메인을 생성할 수 없습니다.' }));
      setIsLoading(false);
      return;
    }

    // 서버로 전송할 데이터 페이로드 구성
    const payload = {
      projectName: formData.projectName,
      description: formData.description,
      githubUrl: formData.githubUrl,
      derivedDomain: slugForApi, // BASE_DOMAIN 제외한 순수 slug 값
      defaultHelmValues: {
        replicaCount: parseInt(formData.helmReplicaCount, 10),
        containerPort: parseInt(formData.containerPort, 10),
      },
    };

    try {
      console.log('서버로 전송할 데이터:', payload); // 개발 중 확인용 로그

      const response = await fetch('/api/project/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 실제 운영 환경에서는 인증 토큰을 헤더에 추가해야 합니다.
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // API 에러 처리 (백엔드 Zod 에러 등)
        const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
        const fieldErrors = responseData.errors; // 백엔드에서 Zod 에러 등을 errors 필드로 전달하는 경우
        
        let finalApiError = errorMessage;
        if (fieldErrors && typeof fieldErrors === 'object') {
            // 백엔드에서 전달된 구체적인 필드 에러 메시지를 추가
            const detailedErrorMessages = Object.entries(fieldErrors)
                .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
                .join('; ');
            if (detailedErrorMessages) {
              finalApiError = `${errorMessage} (상세: ${detailedErrorMessages})`;
            }
        }
        setErrors(prevErrors => ({ ...prevErrors, apiError: finalApiError }));
        setIsLoading(false); // 로딩 상태 종료
        return; // 핸들러 종료
      }

      // --- 프로젝트 생성 성공 처리 ---
      setSuccessMessage(
        responseData.message ||
        `프로젝트 '${payload.projectName}' 생성 요청 성공! 잠시 후 프로젝트 페이지로 이동합니다.`
      );

      // 폼 데이터 초기화 (사용자가 뒤로가기로 돌아왔을 때를 대비)
      setFormData({
        projectName: '',
        description: '',
        githubUrl: '',
        derivedDomain: `.${BASE_DOMAIN}`,
        helmReplicaCount: '1',
        containerPort: '8080',
      });
      setErrors({}); // 에러 상태도 초기화

      setIsLoading(false); // 로딩 상태 종료 (메시지를 보여주는 동안은 로딩이 아님)

      // 일정 시간 후 생성된 프로젝트의 상세 페이지로 리디렉션
      setTimeout(() => {
        // `slugForApi`는 이미 검증되었으므로 사용 가능.
        // 백엔드 응답에 `project.slug`나 `project.id`가 있다면 그것을 사용하는 것이 더 견고할 수 있습니다.
        // 예: const projectIdentifier = responseData.project?.slug || responseData.project?.id || slugForApi;
        router.push(`/project/${slugForApi}`);
      }, REDIRECT_DELAY_MS);

    } catch (error: unknown) {
      // 네트워크 에러 또는 기타 예기치 않은 에러 처리
      console.error('API 호출 또는 처리 중 에러:', error);
      let errorMessage = '프로젝트 생성 중 알 수 없는 에러가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      // API 에러가 이미 설정되지 않은 경우에만 알 수 없는 에러 메시지를 표시
      // (API 응답 에러가 우선순위가 높음)
      if (!errors.apiError) { 
        setErrors(prevErrors => ({ ...prevErrors, apiError: errorMessage }));
      }
      setIsLoading(false); // 로딩 상태 종료
    }
  };

  // --- JSX 렌더링 ---
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161b22] shadow-2xl rounded-lg border border-[#30363d]">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <svg
            className="h-8 w-auto text-orange-400 mr-3" // 아이콘 스타일
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true" // 장식용 아이콘이므로 스크린 리더에서 숨김
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-100">
            새 프로젝트 생성
          </h1>
        </div>

        {/* API 에러 메시지 표시 영역 */}
        {errors.apiError && (
          <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 rounded-md text-sm" role="alert">
            {errors.apiError}
          </div>
        )}

        {/* 성공 메시지 표시 영역 */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 text-green-300 rounded-md text-sm" role="status">
            {successMessage}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로젝트 정보 필드셋 */}
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-gray-300 mb-3">
              프로젝트 정보
            </legend>

            {/* 프로젝트 이름 입력 */}
            <div>
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                프로젝트 이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="projectName"
                id="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${
                  errors.projectName ? 'border-red-600' : 'border-[#30363d]'
                } rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
                placeholder="예: My Awesome App"
                aria-required="true"
                aria-describedby={errors.projectName ? "projectName-error" : undefined}
              />
              {errors.projectName && (
                <p id="projectName-error" className="mt-1 text-xs text-red-400" role="alert">
                  {errors.projectName}
                </p>
              )}
            </div>

            {/* 설명 입력 */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                설명
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#010409] border border-[#30363d] rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200"
                placeholder="프로젝트에 대한 간략한 설명을 입력하세요."
              />
            </div>

            {/* GitHub 저장소 주소 입력 */}
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                GitHub 저장소 주소 (.git으로 끝나야 함){' '}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="githubUrl"
                id="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${
                  errors.githubUrl ? 'border-red-600' : 'border-[#30363d]'
                } rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
                placeholder="예: https://github.com/OWNER/REPOSITORY_NAME.git"
                aria-required="true"
                aria-describedby={errors.githubUrl ? "githubUrl-error" : undefined}
              />
              {errors.githubUrl && (
                <p id="githubUrl-error" className="mt-1 text-xs text-red-400" role="alert">
                  {errors.githubUrl}
                </p>
              )}
            </div>

            {/* 생성될 도메인 표시 (읽기 전용) */}
            <div>
              <label
                htmlFor="derivedDomain"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                생성될 도메인 (프로젝트 이름 기반)
              </label>
              <input
                type="text"
                name="derivedDomain"
                id="derivedDomain"
                value={formData.derivedDomain}
                readOnly
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-gray-400 cursor-not-allowed"
                aria-label="생성될 도메인, 프로젝트 이름에 따라 자동으로 생성됩니다."
              />
              <p className="mt-1 text-xs text-gray-500">
                전체 URL은{' '}
                <code className="text-xs text-blue-400 bg-gray-700 px-1 py-0.5 rounded">
                  https://
                  {formData.derivedDomain || `[project-name].${BASE_DOMAIN}`}
                </code>{' '}
                형식이 됩니다.
              </p>
            </div>
          </fieldset>

          {/* 초기 실행 설정 필드셋 */}
          <fieldset className="space-y-6 pt-6 border-t border-[#30363d]">
            <legend className="text-lg font-semibold text-gray-300 mb-3">
              초기 실행 설정
            </legend>

            {/* 레플리카 수 입력 */}
            <div>
              <label
                htmlFor="helmReplicaCount"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                레플리카 수 (초기 인스턴스){' '}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="helmReplicaCount"
                id="helmReplicaCount"
                value={formData.helmReplicaCount}
                onChange={handleChange}
                min="0" // HTML5 기본 유효성 검사
                className={`w-full px-3 py-2 bg-[#010409] border ${
                  errors.helmReplicaCount
                    ? 'border-red-600'
                    : 'border-[#30363d]'
                } rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
                aria-required="true"
                aria-describedby={errors.helmReplicaCount ? "helmReplicaCount-error" : undefined}
              />
              {errors.helmReplicaCount && (
                <p id="helmReplicaCount-error" className="mt-1 text-xs text-red-400" role="alert">
                  {errors.helmReplicaCount}
                </p>
              )}
            </div>

            {/* 애플리케이션 포트 번호 입력 */}
            <div>
              <label
                htmlFor="containerPort"
                className="block text-sm font-medium text-gray-400 mb-1"
              >
                애플리케이션 포트 번호 <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="containerPort"
                id="containerPort"
                value={formData.containerPort}
                onChange={handleChange}
                min="1"    // HTML5 기본 유효성 검사
                max="65535" // HTML5 기본 유효성 검사
                className={`w-full px-3 py-2 bg-[#010409] border ${
                  errors.containerPort ? 'border-red-600' : 'border-[#30363d]'
                } rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
                placeholder="예: 8080 (애플리케이션이 리스닝하는 포트)"
                aria-required="true"
                aria-describedby={errors.containerPort ? "containerPort-error" : undefined}
              />
              {errors.containerPort && (
                <p id="containerPort-error" className="mt-1 text-xs text-red-400" role="alert">
                  {errors.containerPort}
                </p>
              )}
            </div>
          </fieldset>

          {/* 제출 버튼 */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading || !!successMessage} // 로딩 중이거나 성공 메시지가 떠 있는 동안은 비활성화 (리디렉션 대기)
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  생성 중...
                </>
              ) : (
                '프로젝트 생성 요청'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 푸터 */}
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Intellisia Developer Platform</p>
      </footer>
    </div>
  );
};

export default ProjectCreationForm;