import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';


// ProjectDetails 인터페이스는 이제 이 페이지에서 직접 사용하지 않거나, 최소한으로 사용됩니다.
// interface ProjectDetails { ... }

// 폼 입력 값 타입
interface FormData {
  newBranchName: string;
  // applicationName: string; // 삭제됨
  // dockerfilePath: string; // 삭제됨
  helmReplicaCount: string;
  containerPort: string;
  cpuRequest: string;
  memoryRequest: string;
}

// 폼 필드별 에러 메시지 타입
interface FormErrors {
  newBranchName?: string;
  // applicationName?: string; // 삭제됨
  // dockerfilePath?: string; // 삭제됨
  helmReplicaCount?: string;
  containerPort?: string;
  cpuRequest?: string;
  memoryRequest?: string;
  apiError?: string;
}

const PrepareRunPage: React.FC = () => {
  const router = useRouter();

  const projectNameFromUrl = router.query.projectName as string | undefined;

  // projectDetails 상태는 이제 필수적으로 로드하지 않음
  // const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  // isDataLoading은 더 이상 details API 로딩을 위한 것이 아님 (초기값 false)


  const [formData, setFormData] = useState<FormData>({
    newBranchName: 'main', // 기본적인 일반 기본값
    // applicationName: '',   // useEffect에서 projectNameFromUrl로 채워짐 // 삭제됨
    // dockerfilePath: './Dockerfile', // 삭제됨
    helmReplicaCount: '1',
    containerPort: '8080',
    cpuRequest: '100m',
    memoryRequest: '128Mi',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (router.isReady && !projectNameFromUrl) {
      setErrors(prev => ({ ...prev, apiError: `프로젝트 이름이 URL에 지정되지 않았습니다.` }));
    }
  }, [router.isReady, projectNameFromUrl]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: undefined, apiError: undefined }));
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.newBranchName.trim()) newErrors.newBranchName = '브랜치 이름은 필수입니다.';

    // applicationName 유효성 검사 삭제됨
    // if (!formData.applicationName.trim()) newErrors.applicationName = '애플리케이션 이름은 필수입니다.';

    // dockerfilePath 유효성 검사 삭제됨
    // if (!formData.dockerfilePath.trim()) newErrors.dockerfilePath = 'Dockerfile 경로는 필수입니다.';

    const replicaCount = parseInt(formData.helmReplicaCount, 10);
    if (isNaN(replicaCount) || replicaCount < 0) newErrors.helmReplicaCount = '레플리카 수는 0 이상의 숫자여야 합니다.';
    const port = parseInt(formData.containerPort, 10);
    if (isNaN(port) || port <= 0 || port > 65535) newErrors.containerPort = '유효한 포트 번호(1-65535)를 입력해주세요.';

    const cpuRegex = /^\d+(\.\d+)?m?$|^\d+(\.\d+)?$/;
    if (!formData.cpuRequest.trim()) {
        newErrors.cpuRequest = 'CPU 요청값은 필수입니다.';
    } else if (!cpuRegex.test(formData.cpuRequest.trim())) {
        newErrors.cpuRequest = '올바른 CPU 형식(예: "100m", "0.5")을 입력해주세요.';
    }
    const memoryRegex = /^\d+(\.\d+)?(Ki|Mi|Gi|Ti|Pi|Ei|K|M|G|T|P|E)?$/i;
    if (!formData.memoryRequest.trim()) {
        newErrors.memoryRequest = '메모리 요청값은 필수입니다.';
    } else if (!memoryRegex.test(formData.memoryRequest.trim())) {
        newErrors.memoryRequest = '올바른 메모리 형식(예: "128Mi", "1Gi")을 입력해주세요.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // projectDetails 의존성 제거, projectNameFromUrl로 대체 또는 applicationName 직접 사용
    if (!validateForm() || !projectNameFromUrl) { // applicationName 조건 제거
      if (!projectNameFromUrl) {
          setErrors(prev => ({ ...prev, apiError: "프로젝트 이름이 URL에 없습니다."}));
      }
      return;
    }
    setIsLoading(true);
    setSuccessMessage('');
    setErrors(prevErrors => ({...prevErrors, apiError: undefined}));

    const payload = {
      branch: formData.newBranchName.trim(),
      applicationName: projectNameFromUrl, // URL에서 직접 사용
      dockerfilePath: './Dockerfile', // 하드코딩
      helmValueOverrides: {
        replicaCount: parseInt(formData.helmReplicaCount, 10),
        containerPort: parseInt(formData.containerPort, 10),
        resources: {
            requests: {
                cpu: formData.cpuRequest,
                memory: formData.memoryRequest,
            },
        }
      },
    };

    console.log('백엔드로 전송할 페이로드:', payload);

    try {
      const response = await fetch(`/api/project/${projectNameFromUrl}/versions/initiate-pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || `Error ${response.status}: 파이프라인 시작에 실패했습니다.`;
        setErrors(prev => ({ ...prev, apiError: errorMessage }));
        return;
      }

      setSuccessMessage(responseData.message || `Version ID ${responseData.versionId} (이름: ${responseData.versionName})에 대한 파이프라인이 시작되었습니다!`);

      const targetUrl = `/project/${projectNameFromUrl}/workflow`;
      console.log(`성공! 다음 URL로 이동 시도: ${targetUrl}`);
      router.push(targetUrl);

    } catch (error: unknown) {
      console.error('파이프라인 시작 API 호출 중 네트워크/자바스크립트 에러:', error);
      let errorMessage = '파이프라인 시작 요청 중 오류가 발생했습니다.';
      if (error instanceof Error) errorMessage = error.message;
      setErrors(prevErrors => ({ ...prevErrors, apiError: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!router.isReady) { // isDataLoading 조건 제거, router.isReady만 확인
    return <div className="min-h-screen bg-[#0d1117] text-gray-200 flex justify-center items-center"><p>라우터 준비 중...</p></div>;
  }
  // projectNameFromUrl이 없으면 오류 메시지 표시
  if (!projectNameFromUrl) {
      return <div className="min-h-screen bg-[#0d1117] text-gray-200 flex justify-center items-center"><p className="text-red-400">{errors.apiError || `프로젝트 이름을 URL에서 찾을 수 없습니다. URL 형식을 확인해주세요: /project/[프로젝트이름]/prepare-run`}</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161b22] shadow-2xl rounded-lg border border-[#30363d]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-1">새 파이프라인 실행 설정</h1>
          {/* projectDetails.name 대신 formData.applicationName 또는 projectNameFromUrl 사용 */}
          <p className="text-sm text-gray-400">프로젝트: <span className="font-semibold text-orange-400">{projectNameFromUrl}</span></p>
          {/* projectDetails.githubUrl은 이제 없으므로, 필요하다면 다른 방식으로 표시하거나 생략 */}
          {/* <p className="text-xs text-gray-500 truncate">Git Repo: {projectDetails?.githubUrl}</p> */}
        </div>

        {errors.apiError && <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 rounded-md text-sm">{errors.apiError}</div>}
        {successMessage && <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 text-green-300 rounded-md text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 브랜치 입력 */}
          <div>
            <label htmlFor="newBranchName" className="block text-sm font-medium text-gray-400 mb-1">브랜치 이름 (새로 생성 가능) <span className="text-red-400">*</span></label>
            <input type="text" name="newBranchName" id="newBranchName" value={formData.newBranchName} onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#010409] border ${errors.newBranchName ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
              placeholder="예: feature/new-login 또는 main" />
            {errors.newBranchName && <p className="mt-1 text-xs text-red-400">{errors.newBranchName}</p>}
            <p className="mt-1 text-xs text-gray-500">존재하지 않는 브랜치 입력 시, 프로젝트의 기본 브랜치에서 새로 생성합니다.</p>
          </div>

          {/* 애플리케이션 이름 (URL의 projectNameFromUrl로 고정, 수정 불가) - 삭제됨 */}
          {/* <div>
            <label htmlFor="applicationName" className="block text-sm font-medium text-gray-400 mb-1">애플리케이션 이름</label>
            <input
              type="text" name="applicationName" id="applicationName"
              value={formData.applicationName} // useEffect에서 projectNameFromUrl로 설정됨
              readOnly // 수정 불가
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-gray-400 cursor-not-allowed"
            />
             <p className="mt-1 text-xs text-gray-500">애플리케이션 이름은 URL의 프로젝트 식별자로 자동 설정됩니다.</p>
          </div> */}

          {/* Dockerfile 경로 - 삭제됨 */}
          {/* <div>
            <label htmlFor="dockerfilePath" className="block text-sm font-medium text-gray-400 mb-1">Dockerfile 경로 <span className="text-red-400">*</span></label>
            <input type="text" name="dockerfilePath" id="dockerfilePath" value={formData.dockerfilePath} onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#010409] border ${errors.dockerfilePath ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`} />
            {errors.dockerfilePath && <p className="mt-1 text-xs text-red-400">{errors.dockerfilePath}</p>}
          </div> */}

          <fieldset className="space-y-6 pt-6 border-t border-[#30363d]">
            <legend className="text-lg font-semibold text-gray-300 mb-3">Helm 값 오버라이드 (버전별 리소스 요청)</legend>
            <div className="text-xs text-gray-500 space-y-2">
              <p>
                이 버전에서 사용할 **요청(Request)** 값을 입력하세요. (프로젝트 기본값은 현재 로드되지 않습니다.)
              </p>
              <div>
                <strong className="text-orange-300 block">플랫폼 정책에 따른 자동 제한(Limit) 설정 안내:</strong>
                <ul className="list-disc list-inside pl-2 mt-1 text-gray-400 space-y-0.5">
                  <li>CPU 제한: 일반적으로 입력하신 CPU 요청 값의 **약 1.5배 ~ 2배** 범위 내에서 자동 설정됩니다.</li>
                  <li>메모리 제한: 일반적으로 입력하신 메모리 요청 값의 **약 1.5배 ~ 2배** 범위 내에서 자동 설정됩니다.</li>
                </ul>
                <p className="mt-1">정확한 제한 값은 백엔드에서 최종 결정됩니다.</p>
              </div>
            </div>
            {/* 레플리카 수 */}
            <div>
              <label htmlFor="helmReplicaCount" className="block text-sm font-medium text-gray-400 mb-1">레플리카 수 <span className="text-red-400">*</span></label>
              <input type="number" name="helmReplicaCount" id="helmReplicaCount" value={formData.helmReplicaCount} onChange={handleChange} min="0"
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.helmReplicaCount ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.helmReplicaCount && <p className="mt-1 text-xs text-red-400">{errors.helmReplicaCount}</p>}
            </div>
            {/* 애플리케이션 포트 */}
            <div>
              <label htmlFor="containerPort" className="block text-sm font-medium text-gray-400 mb-1">애플리케이션 포트 <span className="text-red-400">*</span></label>
              <input type="number" name="containerPort" id="containerPort" value={formData.containerPort} onChange={handleChange} min="1" max="65535"
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.containerPort ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.containerPort && <p className="mt-1 text-xs text-red-400">{errors.containerPort}</p>}
            </div>
            {/* CPU 요청 */}
            <div>
              <label htmlFor="cpuRequest" className="block text-sm font-medium text-gray-400 mb-1">CPU 요청 (예: &quot;100m&quot;, &quot;0.5&quot;) <span className="text-red-400">*</span></label>
              <input type="text" name="cpuRequest" id="cpuRequest" value={formData.cpuRequest} onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.cpuRequest ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.cpuRequest && <p className="mt-1 text-xs text-red-400">{errors.cpuRequest}</p>}
            </div>
            {/* 메모리 요청 */}
            <div>
              <label htmlFor="memoryRequest" className="block text-sm font-medium text-gray-400 mb-1">메모리 요청 (예: &quot;128Mi&quot;, &quot;0.5Gi&quot;) <span className="text-red-400">*</span></label>
              <input type="text" name="memoryRequest" id="memoryRequest" value={formData.memoryRequest} onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.memoryRequest ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.memoryRequest && <p className="mt-1 text-xs text-red-400">{errors.memoryRequest}</p>}
            </div>
          </fieldset>

          <div className="pt-6">
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? '파이프라인 시작 중...' : '파이프라인 시작'}
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

export default PrepareRunPage;