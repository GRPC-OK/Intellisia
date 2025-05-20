// pages/create-project.tsx
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';

interface CreateProjectData {
  projectName: string;
  subdomain: string;
  description: string;
  gitRepoUrl: string;
  techStack: string;
  cpu: number;
  memory: number;
  applicationPort: number;
}

const CreateProjectPage = () => {
  const router = useRouter();

  const [projectName, setProjectName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [techStack, setTechStack] = useState('');
  const [cpu, setCpu] = useState<number>(1);
  const [memory, setMemory] = useState<number>(1);
  const [applicationPort, setApplicationPort] = useState<number>(3000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProjectNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newProjectName = e.target.value;
    setProjectName(newProjectName);
    const generatedSubdomain = newProjectName.toLowerCase().replace(/\s+/g, '-');
    setSubdomain(generatedSubdomain);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value);
  const handleGitRepoUrlChange = (e: ChangeEvent<HTMLInputElement>) => setGitRepoUrl(e.target.value);
  const handleTechStackChange = (e: ChangeEvent<HTMLSelectElement>) => setTechStack(e.target.value);
  const handleCpuChange = (e: ChangeEvent<HTMLInputElement>) => setCpu(parseFloat(e.target.value) || 1); // parseFloat으로 변경
  const handleMemoryChange = (e: ChangeEvent<HTMLInputElement>) => setMemory(parseFloat(e.target.value) || 1); // parseFloat으로 변경
  const handleApplicationPortChange = (e: ChangeEvent<HTMLInputElement>) => {
    const port = parseInt(e.target.value, 10);
    setApplicationPort(isNaN(port) ? 0 : port);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (applicationPort <= 0 || applicationPort > 65535) {
      setError('유효한 애플리케이션 포트 번호를 입력해주세요 (1-65535).');
      return;
    }
    // CPU, Memory에 대한 추가적인 클라이언트 사이드 유효성 검사도 고려할 수 있습니다.
    if (cpu <= 0) {
        setError('CPU 값은 0보다 커야 합니다.');
        return;
    }
    if (memory <= 0) {
        setError('메모리 값은 0보다 커야 합니다.');
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
        // API가 JSON 형태의 에러 메시지를 반환한다고 가정
        const errorData = await response.json().catch(() => ({ message: '응답 파싱 중 오류 발생' })); // .json() 실패 대비
        setError(errorData.message || '프로젝트 생성에 실패했습니다.');
      }
    } catch (err: unknown) { // err 타입을 unknown으로 변경
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('API 요청 중 알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // JSX 부분은 이전과 동일하게 유지됩니다. (수정된 코드 스니펫에는 포함하지 않음)
  // ... (이전 답변에서 제공된 JSX return 문 전체) ...
  return (
    <div className="bg-gray-900 text-white p-6 rounded-md shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">새 프로젝트 생성</h2>
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
            required
          >
            <option value="">선택하세요</option>
            <option value="javascript-nodejs">JavaScript (Node.js)</option>
            <option value="python-fastapi">Python (FastAPI)</option>
            <option value="java-springboot">Java (Spring Boot)</option>
            <option value="go-gin">Go (Gin)</option>
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
              min="0.1" // 최소값을 0.1 등으로 설정 가능
              step="0.1"
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
              min="0.1" // 최소값을 0.1 등으로 설정 가능
              step="0.1"
              required
            />
          </div>
        </div>

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