import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';

interface FormData {
  newBranchName: string;
  dockerfilePath: string;
  helmReplicaCount: string;
  containerPort: string;
  cpuRequest: string;
  memoryRequest: string;
}

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
  const projectName = router.query.projectName as string | undefined;

  const [formData, setFormData] = useState<FormData>({
    newBranchName: 'main',
    dockerfilePath: './Dockerfile',
    helmReplicaCount: '1',
    containerPort: '8080',
    cpuRequest: '100m',
    memoryRequest: '128Mi',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (router.isReady && projectName) {
      setFormData((prev) => ({
        ...prev,
      }));
    }
  }, [router.isReady, projectName]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, apiError: undefined }));
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.newBranchName.trim())
      newErrors.newBranchName = '브랜치 이름은 필수입니다.';
    if (!formData.dockerfilePath.trim())
      newErrors.dockerfilePath = 'Dockerfile 경로는 필수입니다.';
    if (isNaN(Number(formData.helmReplicaCount)))
      newErrors.helmReplicaCount = '레플리카 수는 숫자여야 합니다.';
    if (isNaN(Number(formData.containerPort)))
      newErrors.containerPort = '포트는 숫자여야 합니다.';
    if (!formData.cpuRequest.trim())
      newErrors.cpuRequest = 'CPU 요청값은 필수입니다.';
    if (!formData.memoryRequest.trim())
      newErrors.memoryRequest = '메모리 요청값은 필수입니다.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm() || !projectName) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    const payload = {
      branch: formData.newBranchName.trim(),
      helmValueOverrides: {
        replicaCount: parseInt(formData.helmReplicaCount, 10),
        containerPort: parseInt(formData.containerPort, 10),
        resources: {
          requests: {
            cpu: formData.cpuRequest,
            memory: formData.memoryRequest,
          },
        },
      },
    };

    try {
      const res = await fetch(`/api/project/${projectName}/start-flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const message =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message?: string }).message)
            : '파이프라인 시작 실패';
        setErrors((prev) => ({ ...prev, apiError: message }));
        return;
      }

      const versionId =
        typeof data === 'object' && data !== null && 'versionId' in data
          ? (data as { versionId: number }).versionId
          : null;

      if (versionId !== null) {
        setSuccessMessage(`버전 ${versionId} 생성 성공`);
        router.push(`/project/${projectName}/version/${versionId}`);
      } else {
        setErrors((prev) => ({
          ...prev,
          apiError: '버전 ID를 가져올 수 없습니다.',
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '요청 실패';
      setErrors((prev) => ({ ...prev, apiError: message }));
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    name: keyof FormData,
    label: string,
    type: 'text' | 'number' = 'text'
  ) => (
    <div>
      <label htmlFor={name} className="block text-sm text-gray-300 mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-[#010409] border border-[#30363d] rounded-md text-gray-200"
      />
      {errors[name] && (
        <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl p-8 bg-[#161b22] border border-[#30363d] rounded-xl">
        <h1 className="text-2xl font-bold mb-6">파이프라인 실행</h1>

        {errors.apiError && (
          <div className="mb-4 text-red-400">{errors.apiError}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-400">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderInput('newBranchName', '브랜치 이름')}
          {renderInput('dockerfilePath', 'Dockerfile 경로')}
          {renderInput('helmReplicaCount', '레플리카 수', 'number')}
          {renderInput('containerPort', '애플리케이션 포트', 'number')}
          {renderInput('cpuRequest', 'CPU 요청')}
          {renderInput('memoryRequest', '메모리 요청')}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '처리 중...' : '파이프라인 시작'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PrepareRunPage;
