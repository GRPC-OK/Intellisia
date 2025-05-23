import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

// 프로젝트 상세 정보 타입, (API 응답 예상)
interface ProjectDetails {
  idFromDb: number;
  name: string;
  githubUrl: string;
  defaultHelmValues?: {
    replicaCount?: number;
    containerPort?: number;
    cpuRequest?: string;
    memoryRequest?: string;
  };
  defaultBranch?: string;
  defaultDockerfilePath?: string;
}

// 폼 입력 값 타입
interface FormData {
  newBranchName: string;
  dockerfilePath: string;
  helmReplicaCount: string;
  containerPort: string;
  cpuRequest: string;
  memoryRequest: string;
}

// 폼 필드별 에러 메시지 타입
interface FormErrors {
  newBranchName?: string;
  dockerfilePath?: string;
  helmReplicaCount?: string;
  containerPort?: string;
  cpuRequest?: string;
  memoryRequest?: string;
  apiError?: string;
}

const PrepareRunPage: React.FC = () => {
  const router = useRouter();
  const currentIdentifierFromQuery = (router.query.projectId || router.query.projectName) as string | undefined;

  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  const [formData, setFormData] = useState<FormData>({
    newBranchName: '',
    dockerfilePath: './Dockerfile',
    helmReplicaCount: '1',
    containerPort: '8080',
    cpuRequest: '100m',
    memoryRequest: '128Mi',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (currentIdentifierFromQuery) {
      setIsDataLoading(true);
      console.log(`(목업) 프로젝트 식별자 '${currentIdentifierFromQuery}'의 상세 정보 로드 시도...`);

      setTimeout(() => {
        let mockProjectFromApi: ProjectDetails | null = null;
        if (currentIdentifierFromQuery === "testProject001") {
          mockProjectFromApi = {
            idFromDb: 2,
            name: "testProject001",
            githubUrl: `https://github.com/GRPC-OK/Practice.git`,
            defaultHelmValues: {
              replicaCount: 1,
              containerPort: 8080,
              cpuRequest: "150m",
              memoryRequest: "200Mi",
            },
            defaultBranch: 'main',
            defaultDockerfilePath: './data/Dockerfile',
          };
        }

        if (mockProjectFromApi) {
          setProjectDetails(mockProjectFromApi);
          setFormData(prev => ({
            ...prev,
            helmReplicaCount: mockProjectFromApi.defaultHelmValues?.replicaCount?.toString() || '1',
            containerPort: mockProjectFromApi.defaultHelmValues?.containerPort?.toString() || '8080',
            cpuRequest: mockProjectFromApi.defaultHelmValues?.cpuRequest || '100m',
            memoryRequest: mockProjectFromApi.defaultHelmValues?.memoryRequest || '128Mi',
            dockerfilePath: mockProjectFromApi.defaultDockerfilePath || './Dockerfile',
            newBranchName: mockProjectFromApi.defaultBranch || 'main',
          }));
          setErrors({});
        } else {
           setProjectDetails(null);
           setErrors(prev => ({ ...prev, apiError: `(목업) 프로젝트 '${currentIdentifierFromQuery}'에 대한 정보가 없습니다.` }));
        }
        setIsDataLoading(false);
      }, 500);
    } else {
      setIsDataLoading(false);
      setProjectDetails(null);
      setErrors(prev => ({ ...prev, apiError: `프로젝트 식별자가 URL에 지정되지 않았습니다.` }));
      console.log("useEffect: 프로젝트 식별자가 URL 쿼리에서 발견되지 않음.");
    }
    // Line 122 근처: currentIdentifierFromQuery를 의존성 배열에 추가
  }, [router.isReady, currentIdentifierFromQuery]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: undefined, apiError: undefined }));
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.newBranchName.trim()) newErrors.newBranchName = '브랜치 이름은 필수입니다.';
    if (!formData.dockerfilePath.trim()) newErrors.dockerfilePath = 'Dockerfile 경로는 필수입니다.';
    const replicaCount = parseInt(formData.helmReplicaCount, 10);
    if (isNaN(replicaCount) || replicaCount < 0) newErrors.helmReplicaCount = '레플리카 수는 0 이상의 숫자여야 합니다.';
    const port = parseInt(formData.containerPort, 10);
    if (isNaN(port) || port <= 0 || port > 65535) newErrors.containerPort = '유효한 포트 번호(1-65535)를 입력해주세요.';
    if (!formData.cpuRequest.trim()) newErrors.cpuRequest = 'CPU 요청값은 필수입니다.';
    if (!formData.memoryRequest.trim()) newErrors.memoryRequest = '메모리 요청값은 필수입니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !projectDetails || !currentIdentifierFromQuery) {
      if (!projectDetails) setErrors(prev => ({ ...prev, apiError: "프로젝트 정보가 로드되지 않았습니다."}));
      return;
    }
    setIsLoading(true);
    setSuccessMessage('');
    setErrors(prevErrors => ({...prevErrors, apiError: undefined}));

    const payload = {
      branch: formData.newBranchName.trim(),
      applicationName: projectDetails.name,
      dockerfilePath: formData.dockerfilePath,
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
    console.log('백엔드로 전송할 페이로드 (목업):', payload);
    console.log(`API 호출 경로 (목업): /api/project/${currentIdentifierFromQuery}/versions/initiate-pipeline`);

    setTimeout(() => {
      setIsLoading(false);
      if (Math.random() > 0.2) {
        setSuccessMessage(`(테스트) 파이프라인 시작 요청이 접수되었습니다 (프로젝트: ${projectDetails.name}, 브랜치: ${formData.newBranchName}).`);
      } else {
        setErrors(prev => ({ ...prev, apiError: "(테스트) 파이프라인 시작에 실패했습니다."}));
      }
    }, 1500);
  };

  if (isDataLoading) {
    // Line 185 근처: 따옴표 수정
    return <div className="min-h-screen bg-[#0d1117] text-gray-200 flex justify-center items-center"><p>프로젝트 &apos;{currentIdentifierFromQuery || ''}&apos; 정보를 불러오는 중...</p></div>;
  }
  if (!projectDetails) {
     // Line 185 근처: 따옴표 수정
     return <div className="min-h-screen bg-[#0d1117] text-gray-200 flex justify-center items-center"><p className="text-red-400">{errors.apiError || `프로젝트 &apos;${currentIdentifierFromQuery || ''}&apos; 정보를 찾을 수 없습니다. URL을 확인하거나 목업 데이터를 확인하세요.`}</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161b22] shadow-2xl rounded-lg border border-[#30363d]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-1">새 파이프라인 실행 설정</h1>
          <p className="text-sm text-gray-400">프로젝트: <span className="font-semibold text-orange-400">{projectDetails.name}</span></p>
          <p className="text-xs text-gray-500 truncate">Git Repo: {projectDetails.githubUrl}</p>
        </div>

        {errors.apiError && <div className="mb-6 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-300 rounded-md text-sm">{errors.apiError}</div>}
        {successMessage && <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 text-green-300 rounded-md text-sm">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newBranchName" className="block text-sm font-medium text-gray-400 mb-1">브랜치 이름 (새로 생성 가능) <span className="text-red-400">*</span></label>
            <input type="text" name="newBranchName" id="newBranchName" value={formData.newBranchName} onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#010409] border ${errors.newBranchName ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`}
              placeholder="예: feature/new-login 또는 main" />
            {errors.newBranchName && <p className="mt-1 text-xs text-red-400">{errors.newBranchName}</p>}
            <p className="mt-1 text-xs text-gray-500">존재하지 않는 브랜치 입력 시, 프로젝트의 기본 브랜치에서 새로 생성합니다.</p>
          </div>

          <div>
            <label htmlFor="applicationNameDisplay" className="block text-sm font-medium text-gray-400 mb-1">애플리케이션 이름</label>
            <input type="text" name="applicationNameDisplay" id="applicationNameDisplay" value={projectDetails.name} readOnly
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-gray-400 cursor-not-allowed" />
            <p className="mt-1 text-xs text-gray-500">애플리케이션 이름은 프로젝트 이름과 동일하게 자동 설정됩니다.</p>
          </div>

          <div>
            <label htmlFor="dockerfilePath" className="block text-sm font-medium text-gray-400 mb-1">Dockerfile 경로 <span className="text-red-400">*</span></label>
            <input type="text" name="dockerfilePath" id="dockerfilePath" value={formData.dockerfilePath} onChange={handleChange}
              className={`w-full px-3 py-2 bg-[#010409] border ${errors.dockerfilePath ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500 text-gray-200`} />
            {errors.dockerfilePath && <p className="mt-1 text-xs text-red-400">{errors.dockerfilePath}</p>}
          </div>

          <fieldset className="space-y-6 pt-6 border-t border-[#30363d]">
            <legend className="text-lg font-semibold text-gray-300 mb-3">Helm 값 오버라이드 (버전별 리소스 요청)</legend>
            
            <div className="text-xs text-gray-500 space-y-2">
              <div>
                <strong className="block text-gray-400">프로젝트 기본값:</strong>
                <ul className="list-disc list-inside pl-2">
                  <li>Replica: {projectDetails.defaultHelmValues?.replicaCount ?? 'N/A'}</li>
                  <li>Port: {projectDetails.defaultHelmValues?.containerPort ?? 'N/A'}</li>
                  <li>CPU Request: {projectDetails.defaultHelmValues?.cpuRequest ?? 'N/A'}</li>
                  <li>Memory Request: {projectDetails.defaultHelmValues?.memoryRequest ?? 'N/A'}</li>
                </ul>
              </div>
              <p>이 버전에서 다른 <strong>요청(Request)</strong> 값을 사용하려면 아래 필드에 입력하세요.</p>
              <div>
                <strong className="text-orange-300 block">플랫폼 정책에 따른 자동 제한(Limit) 설정 안내:</strong>
                <ul className="list-disc list-inside pl-2 mt-1 text-gray-400 space-y-0.5">
                  <li>CPU 제한: 일반적으로 입력하신 CPU 요청 값의 <strong>약 1.5배 ~ 2배</strong> 범위 내에서 자동 설정됩니다.</li>
                  <li>메모리 제한: 일반적으로 입력하신 메모리 요청 값의 <strong>약 1.5배 ~ 2배</strong> 범위 내에서 자동 설정됩니다.</li>
                </ul>
                <p className="mt-1">정확한 제한 값은 백엔드에서 최종 결정됩니다.</p>
              </div>
            </div>

            <div>
              <label htmlFor="helmReplicaCount" className="block text-sm font-medium text-gray-400 mb-1">레플리카 수 <span className="text-red-400">*</span></label>
              <input type="number" name="helmReplicaCount" id="helmReplicaCount" value={formData.helmReplicaCount} onChange={handleChange} min="0"
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.helmReplicaCount ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.helmReplicaCount && <p className="mt-1 text-xs text-red-400">{errors.helmReplicaCount}</p>}
            </div>
            <div>
              <label htmlFor="containerPort" className="block text-sm font-medium text-gray-400 mb-1">애플리케이션 포트 <span className="text-red-400">*</span></label>
              <input type="number" name="containerPort" id="containerPort" value={formData.containerPort} onChange={handleChange} min="1" max="65535"
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.containerPort ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.containerPort && <p className="mt-1 text-xs text-red-400">{errors.containerPort}</p>}
            </div>
            <div>
              {/* Line 276 근처: 따옴표 수정 */}
              <label htmlFor="cpuRequest" className="block text-sm font-medium text-gray-400 mb-1">CPU 요청 (예: &quot;100m&quot;, &quot;0.5&quot;) <span className="text-red-400">*</span></label>
              <input type="text" name="cpuRequest" id="cpuRequest" value={formData.cpuRequest} onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.cpuRequest ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.cpuRequest && <p className="mt-1 text-xs text-red-400">{errors.cpuRequest}</p>}
            </div>
            <div>
              {/* Line 283 근처: 따옴표 수정 */}
              <label htmlFor="memoryRequest" className="block text-sm font-medium text-gray-400 mb-1">메모리 요청 (예: &quot;128Mi&quot;, &quot;0.5Gi&quot;) <span className="text-red-400">*</span></label>
              <input type="text" name="memoryRequest" id="memoryRequest" value={formData.memoryRequest} onChange={handleChange}
                className={`w-full px-3 py-2 bg-[#010409] border ${errors.memoryRequest ? 'border-red-600' : 'border-[#30363d]'} rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-200`} />
              {errors.memoryRequest && <p className="mt-1 text-xs text-red-400">{errors.memoryRequest}</p>}
            </div>
          </fieldset>

          <div className="pt-6">
            <button type="submit" disabled={isLoading || isDataLoading}
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