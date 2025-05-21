// create-project.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

// 폼 입력 값들의 타입을 정의합니다.
interface FormData {
  projectName: string;
  description: string;
  githubUrl: string;
  derivedDomain: string;
  // 최소한의 Helm 값 필드
  helmReplicaCount: string; // 숫자지만 입력 편의를 위해 string, 추후 number로 변환
  containerPort: string;   // 애플리케이션/컨테이너 포트, 숫자지만 string으로 받고 변환
}

// 폼 필드별 에러 메시지 타입을 정의합니다.
interface FormErrors {
  projectName?: string;
  description?: string;
  githubUrl?: string;
  helmReplicaCount?: string;
  containerPort?: string;
  apiError?: string;
}

const slugifyProjectName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

const ProjectCreationForm: React.FC = () => {
  const BASE_DOMAIN = 'intellisia.app'; // 예시 기본 도메인

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    githubUrl: '',
    derivedDomain: `.${BASE_DOMAIN}`,
    helmReplicaCount: '1', // 기본 레플리카 수
    containerPort: '8080', // 일반적인 웹 애플리케이션 기본 포트 예시
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // 프로젝트 이름, GitHub URL 유효성 검사
    if (!formData.projectName.trim()) {
      newErrors.projectName = '프로젝트 이름은 필수입니다.';
      isValid = false;
    } else if (slugifyProjectName(formData.projectName).length === 0) {
      newErrors.projectName = '프로젝트 이름은 URL 친화적인 유효한 문자를 포함해야 합니다.';
      isValid = false;
    }

    if (!formData.githubUrl.trim()) {
      newErrors.githubUrl = 'GitHub 저장소 주소는 필수입니다.';
      isValid = false;
    } else {
      try {
        const url = new URL(formData.githubUrl);
        if (url.protocol !== 'https:' || !url.hostname.includes('github.com') || !url.pathname.endsWith('.git')) {
          newErrors.githubUrl = '올바른 GitHub 저장소 URL 형식이 아닙니다 (예: https://github.com/OWNER/REPO.git).';
          isValid = false;
        }
      } catch {
        newErrors.githubUrl = '올바른 URL 형식이 아닙니다.';
        isValid = false;
      }
    }

    // Helm 값 유효성 검사
    const replicaCount = parseInt(formData.helmReplicaCount, 10);
    if (isNaN(replicaCount) || replicaCount < 0) {
      newErrors.helmReplicaCount = '레플리카 카운트는 0 이상의 숫자여야 합니다.';
      isValid = false;
    }

    const port = parseInt(formData.containerPort, 10);
    if (isNaN(port) || port <= 0 || port > 65535) {
      newErrors.containerPort = '유효한 포트 번호(1-65535)를 입력해주세요.';
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
      // 프론트엔드에서 입력받은 개별 Helm 값들을 defaultHelmValues JSON 객체로 조립
      // 이 구조는 백엔드와 협의된 최종 defaultHelmValues의 부분 집합이 될 수 있습니다.
      const defaultHelmValues = {
        replicaCount: parseInt(formData.helmReplicaCount, 10),
        // 애플리케이션(컨테이너) 포트는 service.targetPort 또는
        // deployment.containerPort 등으로 매핑될 수 있습니다.
        // 여기서는 일반적인 K8s 서비스의 targetPort를 가정합니다.
        service: {
          targetPort: parseInt(formData.containerPort, 10),
          // service.port 와 service.type 등은 배포 준비 페이지에서 설정하거나
          // 플랫폼의 기본 Helm Chart에서 지능적으로 기본값을 가질 수 있습니다.
          // 예: targetPort와 동일하게 설정하거나, Ingress 사용시 80으로 자동 설정 등
        },
        // resources (cpu, memory) 등은 배포 준비 페이지에서 설정
      };

      const payload = {
        projectName: formData.projectName,
        description: formData.description,
        githubUrl: formData.githubUrl,
        domain: formData.derivedDomain,
        defaultHelmValues: defaultHelmValues, // 최소한의 정보로 구성된 JSON 객체
      };
      console.log('서버로 전송할 데이터:', payload);

      await new Promise(resolve => setTimeout(resolve, 2000)); // 가상 API 호출

      if (Math.random() > 0.5) { // 가상 성공/실패 분기
        setSuccessMessage(`프로젝트 '${formData.projectName}' 생성 요청이 성공적으로 완료되었습니다! (도메인: ${formData.derivedDomain})`);
        setFormData({ // 폼 초기화
          projectName: '',
          description: '',
          githubUrl: '',
          derivedDomain: `.${BASE_DOMAIN}`,
          helmReplicaCount: '1',
          containerPort: '8080',
        });
      } else {
        throw new Error('가상 서버 오류: 이미 사용중인 도메인이거나 내부 처리 오류입니다.');
      }
    } catch (error: unknown) {
      console.error('API 호출 에러:', error);
      let errorMessage = '알 수 없는 에러가 발생했습니다.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
      ) {
        errorMessage = (error as { message: string }).message;
      }
      setErrors(prevErrors => ({ ...prevErrors, apiError: errorMessage, }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161b22] shadow-2xl rounded-lg border border-[#30363d]">
        <div className="flex items-center mb-8">
          <svg className="h-8 w-auto text-orange-400 mr-3" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-100">새 프로젝트 생성</h1>
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
          {/* 프로젝트 기본 정보 섹션 */}
          <fieldset className="space-y-6">
            <legend className="text-lg font-semibold text-gray-300 mb-3">프로젝트 정보</legend>
            {/* 프로젝트 이름 */}
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-400 mb-1">
                프로젝트 이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="projectName"
                id="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.projectName ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
                placeholder="예: My Awesome App"
              />
              {errors.projectName && <p className="mt-1 text-xs text-red-400">{errors.projectName}</p>}
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
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
              <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-400 mb-1">
                GitHub 저장소 주소 (.git으로 끝나야 함) <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="githubUrl"
                id="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.githubUrl ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
                placeholder="예: https://github.com/OWNER/REPOSITORY_NAME.git"
              />
              {errors.githubUrl && <p className="mt-1 text-xs text-red-400">{errors.githubUrl}</p>}
            </div>

            {/* 생성될 도메인 */}
            <div>
              <label htmlFor="derivedDomain" className="block text-sm font-medium text-gray-400 mb-1">
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
                전체 URL은 <code className="text-xs text-blue-400 bg-gray-700 px-1 py-0.5 rounded">https://{formData.derivedDomain || `[project-name].${BASE_DOMAIN}`}</code> 형식이 됩니다.
              </p>
            </div>
          </fieldset>

          {/* 초기 실행 설정 (최소 Helm 값) */}
          <fieldset className="space-y-6 pt-6 border-t border-[#30363d]">
            <legend className="text-lg font-semibold text-gray-300 mb-3">초기 실행 설정</legend>
            
            {/* 레플리카 카운트 */}
            <div>
              <label htmlFor="helmReplicaCount" className="block text-sm font-medium text-gray-400 mb-1">
                레플리카 수 (초기 인스턴스) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                name="helmReplicaCount"
                id="helmReplicaCount"
                value={formData.helmReplicaCount}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.helmReplicaCount ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
              />
              {errors.helmReplicaCount && <p className="mt-1 text-xs text-red-400">{errors.helmReplicaCount}</p>}
            </div>

            {/* 애플리케이션 포트 번호 */}
            <div>
              <label htmlFor="containerPort" className="block text-sm font-medium text-gray-400 mb-1">
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
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.containerPort ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
                placeholder="예: 8080 (애플리케이션이 리스닝하는 포트)"
              />
              {errors.containerPort && <p className="mt-1 text-xs text-red-400">{errors.containerPort}</p>}
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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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