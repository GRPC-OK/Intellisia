// src/pages/create-project.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { CPU_MEMORY_OPTIONS, type CpuMemoryOption } from '@/dtos/project/CreateProjectDto'; // 예시 경로

// 프로젝트 데이터의 타입을 정의하는 인터페이스
interface ProjectData {
  name: string;
  repository: string;
  description?: string;
  namespace?: string;
  githubUrl?: string;
  customDomain?: string;
  cpuMemory?: CpuMemoryOption | '';
  replicas?: number;
}

export default function CreateProjectPageDark() {
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [repository, setRepository] = useState('');
  const [description, setDescription] = useState('');
  const [namespace, setNamespace] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [cpuMemory, setCpuMemory] = useState<CpuMemoryOption | ''>('');
  const [replicas, setReplicas] = useState<number | ''>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const currentFieldErrors: Record<string, string> = {};
    if (!projectName.trim()) {
      currentFieldErrors.projectName = "프로젝트 이름은 필수입니다.";
    } else if (projectName.length > 63) {
      currentFieldErrors.projectName = "프로젝트 이름은 63자를 초과할 수 없습니다.";
    }

    if (!repository.trim()) {
      currentFieldErrors.repository = "Git 저장소 URL은 필수입니다.";
    } else {
      try {
        new URL(repository);
        if (!repository.startsWith('https://') && !repository.startsWith('http://')) {
          currentFieldErrors.repository = "Git 저장소 URL은 http:// 또는 https:// 로 시작해야 합니다.";
        }
      } catch (parseError) {
        console.warn('Repository URL parsing error:', parseError); // parseError 변수 사용
        currentFieldErrors.repository = "유효한 URL 형식이 아닙니다.";
      }
    }

    if (githubUrl.trim()) {
      try {
        new URL(githubUrl);
        if (!githubUrl.startsWith('https://') && !githubUrl.startsWith('http://')) {
          currentFieldErrors.githubUrl = "GitHub URL은 http:// 또는 https:// 로 시작해야 합니다.";
        }
      } catch (parseError) {
        console.warn('GitHub URL parsing error:', parseError); // parseError 변수 사용
        currentFieldErrors.githubUrl = "유효한 GitHub URL 형식이 아닙니다.";
      }
    }

    if (customDomain.trim()) {
      if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/.test(customDomain)) {
        currentFieldErrors.customDomain = "유효한 도메인 형식이 아닙니다. (예: myproject.example.com)";
      }
    }

    if (namespace.trim() && namespace.length > 63) {
      currentFieldErrors.namespace = "네임스페이스는 63자를 초과할 수 없습니다.";
    }

    if (replicas !== '' && (isNaN(Number(replicas)) || Number(replicas) < 1)) {
      currentFieldErrors.replicas = "레플리카 수는 1 이상의 정수여야 합니다.";
    }

    if (Object.keys(currentFieldErrors).length > 0) {
      setFieldErrors(currentFieldErrors);
      setError("입력값을 확인해주세요.");
      setIsLoading(false);
      return;
    }

    // 정의된 ProjectData 인터페이스를 사용하여 타입 명시
    const projectData: ProjectData = {
      name: projectName.trim(),
      repository: repository.trim(),
    };
    if (description.trim()) projectData.description = description.trim();
    if (namespace.trim()) projectData.namespace = namespace.trim();
    if (githubUrl.trim()) projectData.githubUrl = githubUrl.trim();
    if (customDomain.trim()) projectData.customDomain = customDomain.trim();
    if (cpuMemory) projectData.cpuMemory = cpuMemory;
    if (replicas !== '') projectData.replicas = Number(replicas);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
      const responseData = await response.json(); // responseData도 필요시 타입 지정 가능

      if (!response.ok) {
        if (responseData.errors && typeof responseData.errors === 'object' && !Array.isArray(responseData.errors)) {
          setFieldErrors(responseData.errors as Record<string, string>); // 서버 에러 타입에 맞춰 캐스팅
          setError(responseData.message || '입력값에 오류가 있습니다. 각 필드의 오류를 확인해주세요.');
        } else if (responseData.message) {
          setError(responseData.message);
        } else {
          setError('프로젝트 생성에 실패했습니다. (서버 응답 오류)');
        }
        return;
      }

      alert('프로젝트가 성공적으로 생성 요청되었습니다!');
      // 현재 날짜와 시간을 포함하여 성공 메시지를 더 명확하게 할 수 있습니다.
      // 예: alert(`프로젝트가 성공적으로 생성 요청되었습니다! (${new Date().toLocaleString()})`);
      router.push('/projects');

    } catch (err: unknown) { // err 타입을 unknown으로 지정
      console.error("Submit Error:", err);
      let message = '알 수 없는 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
        // 일반 객체 형태의 에러 메시지 처리
        message = (err as { message: string }).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClasses = (fieldName: string) => {
    // baseClasses를 const로 변경
    const baseClasses = "w-full px-3 py-2 bg-gray-700 text-gray-100 border rounded-md focus:outline-none focus:ring-2 placeholder-gray-400";
    if (fieldErrors[fieldName]) {
      return `${baseClasses} border-red-500 focus:ring-red-400`;
    }
    return `${baseClasses} border-gray-600 focus:ring-blue-500 focus:border-blue-500`;
  };

  const getSelectClasses = (fieldName: string) => {
    // baseClasses를 const로 변경
    const baseClasses = "w-full px-3 py-2.5 bg-gray-700 text-gray-100 border rounded-md shadow-sm focus:outline-none focus:ring-2";
    if (fieldErrors[fieldName]) {
      return `${baseClasses} border-red-500 focus:ring-red-400`;
    }
    return `${baseClasses} border-gray-600 focus:ring-blue-500 focus:border-blue-500`;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-10 bg-gray-900 min-h-screen text-gray-200">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-2">새 프로젝트 시작하기</h1>
        <p className="text-gray-400 mb-6 sm:mb-8">
          기본적인 정보 몇 가지만 입력하시면 추천 설정으로 빠르게 프로젝트를 배포할 수 있습니다.
        </p>

        {error && !Object.keys(fieldErrors).length && (
          <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded-md relative mb-6" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          <fieldset className="border border-gray-700 p-4 sm:p-6 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-200">1. 필수 정보</legend>
            <p className="text-sm text-gray-400 mt-1 mb-4 px-2">아래 정보는 프로젝트 배포를 위해 꼭 필요합니다.</p>
            <div className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-1">
                  프로젝트 이름 <span className="text-red-400">*</span>
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="예: my-awesome-project"
                  className={getInputClasses('projectName')}
                />
                {fieldErrors.projectName && <p className="text-red-400 text-xs mt-1">{fieldErrors.projectName}</p>}
              </div>
              <div>
                <label htmlFor="repository" className="block text-sm font-medium text-gray-300 mb-1">
                  Git 저장소 URL <span className="text-red-400">*</span>
                </label>
                <input
                  id="repository"
                  type="url"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  placeholder="예: https://github.com/user/repo.git"
                  className={getInputClasses('repository')}
                />
                {fieldErrors.repository && <p className="text-red-400 text-xs mt-1">{fieldErrors.repository}</p>}
              </div>
            </div>
          </fieldset>

          <fieldset className="border border-gray-700 p-4 sm:p-6 rounded-md">
            <legend className="text-lg font-semibold px-2 text-gray-200">2. 선택 정보 (고급 설정)</legend>
            <p className="text-sm text-gray-400 mt-1 mb-4 px-2">
              아래 정보는 입력하지 않으시면 가장 추천하는 기본값으로 자동 설정됩니다.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">프로젝트 설명</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 이 프로젝트는 멋진 기능을 제공합니다."
                  rows={3}
                  className={getInputClasses('description')}
                />
              </div>
              <div>
                <label htmlFor="namespace" className="block text-sm font-medium text-gray-300 mb-1">네임스페이스</label>
                <input
                  id="namespace"
                  type="text"
                  value={namespace}
                  onChange={(e) => setNamespace(e.target.value)}
                  placeholder="미입력 시 자동 할당"
                  className={getInputClasses('namespace')}
                />
                {fieldErrors.namespace && <p className="text-red-400 text-xs mt-1">{fieldErrors.namespace}</p>}
                <small className="block mt-1 text-xs text-gray-500">미입력 시 프로젝트 이름 등을 기반으로 추천 네임스페이스가 자동 할당됩니다.</small>
              </div>
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-1">GitHub 프로젝트 URL (웹 주소)</label>
                <input
                  id="githubUrl"
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="예: https://github.com/user/repo (선택 사항)"
                  className={getInputClasses('githubUrl')}
                />
                {fieldErrors.githubUrl && <p className="text-red-400 text-xs mt-1">{fieldErrors.githubUrl}</p>}
              </div>
              <div>
                <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-1">사용자 지정 도메인</label>
                <input
                  id="customDomain"
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="예: my-project.example.com (선택 사항)"
                  className={getInputClasses('customDomain')}
                />
                {fieldErrors.customDomain && <p className="text-red-400 text-xs mt-1">{fieldErrors.customDomain}</p>}
                <small className="block mt-1 text-xs text-gray-500">미입력 시 시스템 기본 접근 주소가 제공됩니다.</small>
              </div>
              <div>
                <label htmlFor="cpuMemory" className="block text-sm font-medium text-gray-300 mb-1">리소스 크기 (CPU/Memory)</label>
                <select
                  id="cpuMemory"
                  value={cpuMemory}
                  onChange={(e) => setCpuMemory(e.target.value as CpuMemoryOption | '')}
                  className={getSelectClasses('cpuMemory')}
                >
                  <option value="" className="text-gray-500">기본값 (Small)</option>
                  {CPU_MEMORY_OPTIONS.map(option => (
                    <option key={option} value={option} className="bg-gray-700 text-gray-100">{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
                {fieldErrors.cpuMemory && <p className="text-red-400 text-xs mt-1">{fieldErrors.cpuMemory}</p>}
                <small className="block mt-1 text-xs text-gray-500">기본값: Small. 워크로드에 맞춰 선택하세요.</small>
              </div>
              <div>
                <label htmlFor="replicas" className="block text-sm font-medium text-gray-300 mb-1">인스턴스 수 (Replicas)</label>
                <input
                  id="replicas"
                  type="number"
                  value={replicas}
                  min="1"
                  onChange={(e) => setReplicas(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="기본값 (1)"
                  className={getInputClasses('replicas')}
                />
                {fieldErrors.replicas && <p className="text-red-400 text-xs mt-1">{fieldErrors.replicas}</p>}
                <small className="block mt-1 text-xs text-gray-500">기본값: 1. 트래픽에 맞춰 조절하세요.</small>
              </div>
            </div>
          </fieldset>

          <div className="bg-gray-700 border border-gray-600 p-4 rounded-md text-sm text-gray-300">
            <h4 className="font-semibold text-gray-100 mb-1">중요 안내</h4>
            <p className="leading-relaxed">
              이전에 필요했던 Ingress, Service 설정, Helm Values 같은 복잡한 구성은 이제 직접 입력하지 않으셔도 됩니다.
              시스템이 Git 저장소 정보를 분석하여 가장 일반적이고 안정적인 기본값으로 자동 설정하여 배포합니다.
              세부 설정은 <strong className="text-blue-400">배포 시작 전, 배포 버전 준비 페이지</strong>에서 언제든지 수정 가능합니다.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isLoading ? '생성 중...' : '기본 설정으로 프로젝트 생성 및 배포'}
          </button>
        </form>
      </div>
    </div>
  );
}