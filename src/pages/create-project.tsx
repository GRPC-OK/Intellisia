import React, { useState, ChangeEvent, FormEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

// --- 상수 정의 ---
/**
 * 프로젝트가 생성될 기본 도메인입니다.
 * 중요: 새로운 요구사항에 따라 'intellisia.site'로 변경되었습니다.
 * 예: 'my-app.intellisia.site' 형태로 사용됩니다.
 */
const BASE_DOMAIN = 'intellisia.site';

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
  // helmReplicaCount: string; // 삭제됨
  // containerPort: string; // 삭제됨
}

/**
 * 폼 필드별 에러 메시지 및 API 에러 메시지 타입을 정의합니다.
 */
interface FormErrors {
  projectName?: string;
  description?: string;
  githubUrl?: string;
  // helmReplicaCount?: string; // 삭제됨
  // containerPort?: string; // 삭제됨
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
    derivedDomain: `.${BASE_DOMAIN}`, // 초기값은 변경된 BASE_DOMAIN을 사용
    // helmReplicaCount: '1', // 삭제됨
    // containerPort: '8080', // 삭제됨
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // --- 효과 (Effects) ---
  useEffect(() => {
    const slug = slugifyProjectName(formData.projectName);
    setFormData(prevData => ({
      ...prevData,
      // derivedDomain은 UI 표시용으로, 변경된 BASE_DOMAIN을 사용합니다.
      derivedDomain: slug ? `${slug}.${BASE_DOMAIN}` : `.${BASE_DOMAIN}`,
    }));
  }, [formData.projectName]);


  // --- 이벤트 핸들러 및 유효성 검사 ---
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));

      if (errors[name as keyof FormErrors]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
      }
      if (errors.apiError) {
        setErrors(prevErrors => ({ ...prevErrors, apiError: undefined }));
      }
      setSuccessMessage('');
    },
    [errors]
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.projectName.trim()) {
      newErrors.projectName = '프로젝트 이름은 필수입니다.';
      isValid = false;
    } else if (slugifyProjectName(formData.projectName).length === 0) {
      newErrors.projectName =
        '프로젝트 이름은 URL 친화적인 유효한 문자를 포함해야 합니다.';
      isValid = false;
    }

    if (!formData.githubUrl.trim()) {
      newErrors.githubUrl = 'GitHub 저장소 주소는 필수입니다.';
      isValid = false;
    } else {
      try {
        const url = new URL(formData.githubUrl);
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

    // 레플리카 수 및 포트 유효성 검사 삭제됨
    // const replicaCount = parseInt(formData.helmReplicaCount, 10);
    // if (isNaN(replicaCount) || replicaCount < 0) {
    //   newErrors.helmReplicaCount = '레플리카 수는 0 이상의 정수여야 합니다.';
    //   isValid = false;
    // }

    // const port = parseInt(formData.containerPort, 10);
    // if (isNaN(port) || port <= 0 || port > 65535) {
    //   newErrors.containerPort =
    //     '유효한 포트 번호(1-65535)를 입력해주세요.';
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrors(prevErrors => ({ ...prevErrors, apiError: undefined }));

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const slugForApi = slugifyProjectName(formData.projectName);
    if (!slugForApi) {
      setErrors(prevErrors => ({ ...prevErrors, projectName: '유효한 프로젝트 이름으로 도메인을 생성할 수 없습니다.' }));
      setIsLoading(false);
      return;
    }

    // 백엔드로 전송되는 payload의 derivedDomain은 순수 slug 값 (예: 'sasa') 입니다.
    // 백엔드에서 이 slug에 '.intellisia.site'를 붙여 전체 도메인을 구성합니다.
    const payload = {
      projectName: formData.projectName,
      description: formData.description,
      githubUrl: formData.githubUrl,
      derivedDomain: slugForApi,
      // defaultHelmValues는 이제 백엔드에서 기본값을 처리하거나,
      // 이 폼에서 제거되었으므로 전송하지 않습니다.
      // defaultHelmValues: {
      //   replicaCount: parseInt(formData.helmReplicaCount, 10),
      //   containerPort: parseInt(formData.containerPort, 10),
      // },
    };

    try {
      console.log('서버로 전송할 데이터:', payload);

      const response = await fetch('/api/project/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
        const fieldErrors = responseData.errors;

        let finalApiError = errorMessage;
        if (fieldErrors && typeof fieldErrors === 'object') {
            const detailedErrorMessages = Object.entries(fieldErrors)
                .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
                .join('; ');
            if (detailedErrorMessages) {
              finalApiError = `${errorMessage} (상세: ${detailedErrorMessages})`;
            }
        }
        setErrors(prevErrors => ({ ...prevErrors, apiError: finalApiError }));
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        responseData.message ||
        `프로젝트 '${payload.projectName}' 생성 요청 성공! 잠시 후 프로젝트 페이지로 이동합니다.`
      );
      setFormData({
        projectName: '',
        description: '',
        githubUrl: '',
        derivedDomain: `.${BASE_DOMAIN}`,
        // helmReplicaCount: '1', // 삭제됨
        // containerPort: '8080', // 삭제됨
      });
      setErrors({});
      setIsLoading(false);

      setTimeout(() => {
        router.push(`/project/${slugForApi}`);
      }, REDIRECT_DELAY_MS);

    } catch (error: unknown) {
      console.error('API 호출 또는 처리 중 에러:', error);
      let errorMessage = '프로젝트 생성 중 알 수 없는 에러가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (!errors.apiError) {
        setErrors(prevErrors => ({ ...prevErrors, apiError: errorMessage }));
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161b22] shadow-2xl rounded-lg border border-[#30363d]">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">
            새 프로젝트 생성
          </h1>
        </div>

        {errors.apiError && (
          <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 rounded-md text-sm" role="alert">
            {errors.apiError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 text-green-300 rounded-md text-sm" role="status">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-gray-300 mb-3">
              프로젝트 정보
            </legend>

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
                value={formData.derivedDomain} // 이 값은 'slug.intellisia.site' 형태로 표시됨
                readOnly
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-gray-400 cursor-not-allowed"
                aria-label="생성될 도메인, 프로젝트 이름에 따라 자동으로 생성됩니다."
              />
              <p className="mt-1 text-xs text-gray-500">
                전체 URL은{' '}
                <code className="text-xs text-blue-400 bg-gray-700 px-1 py-0.5 rounded">
                  https://
                  {/* formData.derivedDomain이 비어있으면 '[project-name].intellisia.site' 형태로 표시 */}
                  {formData.derivedDomain || `[project-name].${BASE_DOMAIN}`}
                </code>{' '}
                형식이 됩니다.
              </p>
            </div>
          </fieldset>

          {/* 초기 실행 설정 필드셋이 통째로 삭제됨 */}
          {/* <fieldset className="space-y-6 pt-6 border-t border-[#30363d]">
            <legend className="text-lg font-semibold text-gray-300 mb-3">
              초기 실행 설정
            </legend>

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
                min="0"
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
                min="1"
                max="65535"
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
          </fieldset> */}

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading || !!successMessage}
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

    </div>
  );
};

export default ProjectCreationForm;