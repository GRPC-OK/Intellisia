//create-project.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';

// 폼 입력 값들의 타입을 정의합니다.
interface FormData {
  projectName: string;
  description: string;
  githubUrl: string;
  derivedDomain: string;
  defaultHelmValues: string;
}

// 폼 필드별 에러 메시지 타입을 정의합니다.
interface FormErrors {
  projectName?: string;
  description?: string;
  githubUrl?: string;
  defaultHelmValues?: string;
  apiError?: string;
}

// 프로젝트 이름을 URL 친화적인 형태로 변환하는 헬퍼 함수
const slugifyProjectName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/[^\w-]+/g, ''); // 영숫자, 하이픈 이외의 문자 제거
};

const ProjectCreationForm: React.FC = () => {
  // Intellisia.app과 같은 실제 운영 도메인으로 변경할 예정입니다.
  // 혹은, 환경 변수에서 이 값을 가져오는게 좋을까요?
  const BASE_DOMAIN = 'intellisia.app'; // 예시 기본 도메인

  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    description: '',
    githubUrl: '',
    derivedDomain: `.${BASE_DOMAIN}`,
    defaultHelmValues: '{\n  "replicaCount": 1,\n  "service": {\n    "type": "ClusterIP",\n    "port": 80\n  }\n}',
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


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      } catch (_) {
        newErrors.githubUrl = '올바른 URL 형식이 아닙니다.';
        isValid = false;
      }
    }

    try {
      if (formData.defaultHelmValues.trim()) {
        JSON.parse(formData.defaultHelmValues);
      }
    } catch (e) {
      newErrors.defaultHelmValues = 'Helm 값은 올바른 JSON 형식이거나 비워두어야 합니다.';
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
      const payload = {
        projectName: formData.projectName,
        description: formData.description,
        githubUrl: formData.githubUrl,
        domain: formData.derivedDomain,
        defaultHelmValues: formData.defaultHelmValues.trim()
          ? JSON.parse(formData.defaultHelmValues)
          : {},
      };
      console.log('서버로 전송할 데이터:', payload);

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (Math.random() > 0.5) {
        setSuccessMessage(`프로젝트 '${formData.projectName}' 생성 요청이 성공적으로 완료되었습니다! (도메인: ${formData.derivedDomain})`);
        setFormData({
          projectName: '',
          description: '',
          githubUrl: '',
          derivedDomain: `.${BASE_DOMAIN}`,
          defaultHelmValues: '{\n  "replicaCount": 1,\n  "service": {\n    "type": "ClusterIP",\n    "port": 80\n  }\n}',
        });
      } else {
        throw new Error('가상 서버 오류: 이미 사용중인 도메인이거나 내부 처리 오류입니다.');
      }
    } catch (error: any) {
      console.error('API 호출 에러:', error);
      setErrors(prevErrors => ({
        ...prevErrors,
        apiError: error.message || '알 수 없는 에러가 발생했습니다.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 전체 페이지 배경 (GitHub의 매우 어두운 배경 느낌)
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col items-center py-10 px-4">
      {/* 폼 컨테이너 (페이지 배경보다 약간 밝은 어두운 색) */}
      <div className="w-full max-w-2xl p-8 bg-[#161b22] shadow-2xl rounded-lg border border-[#30363d]">
        <div className="flex items-center mb-8">
          {/* 로고 예시 (Intellisia 로고 SVG 또는 이미지로 교체 가능) */}
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
          // 이미지의 성공 메시지와 유사한 스타일
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 text-green-300 rounded-md text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              // 입력 필드 배경 및 테두리 (GitHub 입력 필드 느낌)
              className={`w-full px-3 py-2 bg-[#010409] border ${
                errors.projectName ? 'border-red-600' : 'border-[#30363d]'
              } rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
              placeholder="예: My Awesome App"
            />
            {errors.projectName && <p className="mt-1 text-xs text-red-400">{errors.projectName}</p>}
          </div>

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
              className={`w-full px-3 py-2 bg-[#010409] border ${
                errors.githubUrl ? 'border-red-600' : 'border-[#30363d]'
              } rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
              placeholder="예: https://github.com/OWNER/REPOSITORY_NAME.git"
            />
            {errors.githubUrl && <p className="mt-1 text-xs text-red-400">{errors.githubUrl}</p>}
          </div>

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
              // 읽기 전용 필드 스타일
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              전체 URL은 <code className="text-xs text-blue-400 bg-gray-700 px-1 py-0.5 rounded">https://{formData.derivedDomain || `[project-name].${BASE_DOMAIN}`}</code> 형식이 됩니다.
            </p>
          </div>

          <div>
            <label htmlFor="defaultHelmValues" className="block text-sm font-medium text-gray-400 mb-1">
              기본 Helm 값 (JSON 형식)
            </label>
            <textarea
              name="defaultHelmValues"
              id="defaultHelmValues"
              rows={6}
              value={formData.defaultHelmValues}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#010409] border font-mono text-sm ${
                errors.defaultHelmValues ? 'border-red-600' : 'border-[#30363d]'
              } rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
              placeholder='예: {\n  "replicaCount": 1,\n  "image": {\n    "repository": "nginx",\n    "tag": "stable"\n  }\n}'
            />
            {errors.defaultHelmValues && <p className="mt-1 text-xs text-red-400">{errors.defaultHelmValues}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              // 버튼 스타일 (GitHub의 파란색 버튼 느낌)
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