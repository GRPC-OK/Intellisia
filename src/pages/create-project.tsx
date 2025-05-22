// src/pages/create-project.tsx 수정

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

// 폼 입력 값들의 타입을 정의합니다.
interface FormData {
  projectName: string;
  description: string;
  githubUrl: string;
  derivedDomain: string; // UI 표시용 전체 도메인 (예: my-app.intellisia.app)
  helmReplicaCount: string;
  containerPort: string;
}

// 폼 필드별 에러 메시지 타입을 정의합니다.
interface FormErrors {
  projectName?: string;
  description?: string;
  githubUrl?: string;
  helmReplicaCount?: string;
  containerPort?: string;
  apiError?: string; // API 호출 관련 에러 메시지
}

// 프로젝트 이름을 URL 친화적인 슬러그로 변환하는 함수 (예시 구현)
const slugifyProjectName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase() // 소문자로
    .trim() // 양쪽 공백 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .replace(/[^\w-]+/g, '') // 영숫자, 밑줄, 하이픈 외 문자 제거
    .replace(/--+/g, '-'); // 연속된 하이픈을 하나로
};

const ProjectCreationForm: React.FC = () => {
  const BASE_DOMAIN = 'intellisia.app'; // 실제 사용하는 기본 도메인으로 변경하세요.

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    githubUrl: '',
    derivedDomain: `.${BASE_DOMAIN}`, // 초기값
    helmReplicaCount: '1',
    containerPort: '8080',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const slug = slugifyProjectName(formData.projectName);
    setFormData(prevData => ({
      ...prevData,
      derivedDomain: slug ? `${slug}.${BASE_DOMAIN}` : `.${BASE_DOMAIN}`,
    }));
  }, [formData.projectName, BASE_DOMAIN]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));

    // 입력 변경 시 해당 필드 에러 및 API 에러 초기화
    if (errors[name as keyof FormErrors]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    }
    if (errors.apiError) {
      setErrors(prevErrors => ({ ...prevErrors, apiError: undefined }));
    }
    setSuccessMessage(''); // 성공 메시지도 초기화
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 프로젝트 이름 유효성 검사
    if (!formData.projectName.trim()) {
      newErrors.projectName = '프로젝트 이름은 필수입니다.';
      isValid = false;
    } else if (slugifyProjectName(formData.projectName).length === 0) {
      newErrors.projectName =
        '프로젝트 이름은 URL 친화적인 유효한 문자를 포함해야 합니다.';
      isValid = false;
    }

    // GitHub URL 유효성 검사
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

    // Helm 값 유효성 검사 (레플리카 수)
    const replicaCount = parseInt(formData.helmReplicaCount, 10);
    if (isNaN(replicaCount) || replicaCount < 0) {
      newErrors.helmReplicaCount = '레플리카 수는 0 이상의 숫자여야 합니다.';
      isValid = false;
    }

    // Helm 값 유효성 검사 (컨테이너 포트)
    const port = parseInt(formData.containerPort, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      newErrors.containerPort =
        '유효한 포트 번호(1-65535)를 입력해주세요.';
      isValid = false;
    }

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

    try {
      const defaultHelmValues = {
        replicaCount: parseInt(formData.helmReplicaCount, 10),
        containerPort: parseInt(formData.containerPort, 10),
      };

      // 백엔드로 전송할 derivedDomain은 순수 slug 값이어야 합니다.
      const slugForApi = slugifyProjectName(formData.projectName);
      if (!slugForApi) { // 혹시 모를 경우 방어
        setErrors(prevErrors => ({ ...prevErrors, projectName: '유효한 프로젝트 이름으로 도메인을 생성할 수 없습니다.'}));
        setIsLoading(false);
        return;
      }


      const payload = {
        projectName: formData.projectName,
        description: formData.description,
        githubUrl: formData.githubUrl,
        derivedDomain: slugForApi, // BASE_DOMAIN을 제외한 순수 slug 값
        defaultHelmValues: defaultHelmValues,
      };
      console.log('서버로 전송할 데이터:', payload);

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 실제 인증 토큰이 있다면 헤더에 추가
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
        const fieldErrors = responseData.errors; // 백엔드 Zod 에러 상세
        
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
        // throw new Error(finalApiError); // 에러를 발생시켜 catch 블록으로 이동시킬 수도 있으나, 여기서는 상태로 관리
        setIsLoading(false); // 로딩 상태 해제
        return; // 핸들러 종료
      }

      setSuccessMessage(responseData.message || `프로젝트 '${payload.projectName}' 생성 요청이 성공적으로 완료되었습니다!`);
      
      setFormData({
        projectName: '',
        description: '',
        githubUrl: '',
        derivedDomain: `.${BASE_DOMAIN}`,
        helmReplicaCount: '1',
        containerPort: '8080',
      });
      setErrors({}); // 이전 에러 상태 초기화
    } catch (error: unknown) {
      console.error('API 호출 또는 처리 중 에러:', error);
      if (!errors.apiError) {
        let errorMessage = '프로젝트 생성 중 알 수 없는 에러가 발생했습니다.';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setErrors(prevErrors => ({ ...prevErrors, apiError: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161b22] shadow-2xl rounded-lg border border-[#30363d]">
        <div className="flex items-center mb-8">
          <svg
            className="h-8 w-auto text-orange-400 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
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

        {errors.apiError && (
          <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 rounded-md text-sm">
            {errors.apiError}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 text-green-300 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-gray-300 mb-3">
              프로젝트 정보
            </legend>
            {/* 프로젝트 이름 */}
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
              />
              {errors.projectName && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.projectName}
                </p>
              )}
            </div>

            {/* 설명 */}
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

            {/* GitHub 저장소 주소 */}
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
              />
              {errors.githubUrl && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.githubUrl}
                </p>
              )}
            </div>

            {/* 생성될 도메인 */}
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

          {/* 초기 실행 설정 (최소 Helm 값) */}
          <fieldset className="space-y-6 pt-6 border-t border-[#30363d]">
            <legend className="text-lg font-semibold text-gray-300 mb-3">
              초기 실행 설정
            </legend>

            {/* 레플리카 카운트 */}
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
              />
              {errors.helmReplicaCount && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.helmReplicaCount}
                </p>
              )}
            </div>

            {/* 애플리케이션 포트 번호 */}
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
              />
              {errors.containerPort && (
                <p className="mt-1 text-xs text-red-400">
                  {errors.containerPort}
                </p>
              )}
            </div>
          </fieldset>

          {/* 제출 버튼 */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
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
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Intellisia Developer Platform</p>
      </footer>
    </div>
  );
};

export default ProjectCreationForm;