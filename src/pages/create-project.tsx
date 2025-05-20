// pages/create-project.tsx
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';

// 프로젝트 생성 요청 시 보낼 데이터 타입 정의
interface CreateProjectData {
  projectName: string;
  subdomain: string;
  description: string;
  gitRepoUrl: string;
  techStack: string;
  cpu: number;
  memory: number;
  applicationPort: number; // 네트워크 관련 필드는 이것만 남음
}

const CreateProjectPage = () => {
  const router = useRouter();

  // 각 입력 필드의 상태를 관리하는 state 변수들
  const [projectName, setProjectName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [cpu, setCpu] = useState<number>(1);
  const [memory, setMemory] = useState<number>(1);
  const [applicationPort, setApplicationPort] = useState<number>(3000); // 기본 애플리케이션 포트
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 프로젝트 이름 변경 시 하위 도메인을 자동으로 생성하는 함수
  const handleProjectNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newProjectName = e.target.value;
    setProjectName(newProjectName);
    const generatedSubdomain = newProjectName.toLowerCase().replace(/\s+/g, '-');
    setSubdomain(generatedSubdomain);
  };

  // 각 입력 필드의 변경 이벤트를 처리하는 함수들
  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value);
  const handleGitRepoUrlChange = (e: ChangeEvent<HTMLInputElement>) => setGitRepoUrl(e.target.value);
  const handleTechStackChange = (e: ChangeEvent<HTMLSelectElement>) => setTechStack(e.target.value);
  const handleCpuChange = (e: ChangeEvent<HTMLInputElement>) => setCpu(parseInt(e.target.value, 10) || 1);
  const handleMemoryChange = (e: ChangeEvent<HTMLInputElement>) => setMemory(parseInt(e.target.value, 10) || 1);
  const handleApplicationPortChange = (e: ChangeEvent<HTMLInputElement>) => {
    const port = parseInt(e.target.value, 10);
    setApplicationPort(isNaN(port) ? 0 : port); // 0 또는 다른 기본값/유효성 검사 필요
  };

  // 폼 제출 이벤트 처리 함수
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (applicationPort <= 0 || applicationPort > 65535) {
      setError('유효한 애플리케이션 포트 번호를 입력해주세요 (1-65535).');
      return;
    }

    setLoading(true);
    setError(null);

    const projectData: CreateProjectData = {
      projectName,
      subdomain,
      description,
      gitRepoUrl,
      techStack,
      cpu,
      memory,
      applicationPort,
    };

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/projects/${result.projectId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || '프로젝트 생성에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || 'API 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-md shadow-md max-w-2xl mx-auto"> {/* max-width 추가 */}
      <h2 className="text-2xl font-bold mb-6 text-center">새 프로젝트 생성</h2> {/* 스타일 변경 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="projectName" className="block text-gray-300 text-sm font-bold mb-2">
            프로젝트 이름
          </label>
          <input
            type="text"
            id="projectName"
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline"
            value={projectName}
            onChange={handleProjectNameChange}
            required
          />
        </div>
        <div>
          <label htmlFor="subdomain" className="block text-gray-300 text-sm font-bold mb-2">
            하위 도메인
          </label>
          <input
            type="text"
            id="subdomain"
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
            value={subdomain}
            readOnly
          />
          <p className="text-gray-500 text-xs italic mt-1">프로젝트 이름에서 자동으로 생성됩니다.</p>
        </div>
        <div>
          <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">
            프로젝트 설명 (선택 사항)
          </label>
          <textarea
            id="description"
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline h-24"
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        <div>
          <label htmlFor="gitRepoUrl" className="block text-gray-300 text-sm font-bold mb-2">
            Git 레포지토리 URL
          </label>
          <input
            type="url"
            id="gitRepoUrl"
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline"
            value={gitRepoUrl}
            onChange={handleGitRepoUrlChange}
            required
            placeholder="https://github.com/user/repo.git"
          />
        </div>
        <div>
          <label htmlFor="techStack" className="block text-gray-300 text-sm font-bold mb-2">
            프로그래밍 언어/기술 스택
          </label>
          <select
            id="techStack"
            className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline"
            value={techStack}
            onChange={handleTechStackChange}
            required // 기술 스택도 필수로 가정
          >
            <option value="">선택하세요</option>
            <option value="javascript-nodejs">JavaScript (Node.js)</option>
            <option value="python-fastapi">Python (FastAPI)</option>
            <option value="java-springboot">Java (Spring Boot)</option>
            <option value="go-gin">Go (Gin)</option>
            {/* 다른 기술 스택 옵션 추가 */}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cpu" className="block text-gray-300 text-sm font-bold mb-2">
              CPU 설정 (Cores)
            </label>
            <input
              type="number"
              id="cpu"
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline"
              value={cpu}
              onChange={handleCpuChange}
              min="1"
              step="0.1" // CPU는 소수점 단위도 가능할 수 있음
              required
            />
          </div>
          <div>
            <label htmlFor="memory" className="block text-gray-300 text-sm font-bold mb-2">
              메모리 설정 (GB)
            </label>
            <input
              type="number"
              id="memory"
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline"
              value={memory}
              onChange={handleMemoryChange}
              min="0.5" // 메모리도 소수점 단위 가능할 수 있음
              step="0.1"
              required
            />
          </div>
        </div>

        {/* --- 네트워크 설정 (최종 간소화된 부분) --- */}
        <div className="border-t border-gray-700 pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">네트워크 설정</h3>
            <p className="text-sm text-gray-400 mb-4">모든 프로젝트는 기본적으로 외부 공개되며, 애플리케이션 내부 포트를 지정해주세요.</p>
            
            <div>
              <label htmlFor="applicationPort" className="block text-gray-300 text-sm font-bold mb-1">
                [필수] 애플리케이션 포트
              </label>
              <input
                type="number"
                id="applicationPort"
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-white leading-tight focus:outline-none focus:shadow-outline"
                value={applicationPort}
                onChange={handleApplicationPortChange}
                min="1"
                max="65535"
                required
                placeholder="예: 3000 또는 8080"
              />
              <p className="text-gray-500 text-xs italic mt-1">
                애플리케이션이 내부적으로 요청을 기다리는 포트 번호입니다.
              </p>
            </div>
        </div>
        {/* --- 여기까지 네트워크 설정 --- */}

        <button
          type="submit"
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? '프로젝트 생성 중...' : 'Start Project Creation'}
        </button>
        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
      </form>
    </div>
  );
};

export default CreateProjectPage;