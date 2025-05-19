// src/pages/dashboard.tsx
import React, { useEffect, useState } from 'react'; // useState, useEffect 임포트
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

// DB에서 가져올 프로젝트 데이터의 타입을 정의합니다. (백엔드 API 응답 타입과 일치)
interface ProjectData {
  id: number; // DB ID (고유 키로 사용)
  name: string;
}

export default function Dashboard() {
  const router = useRouter();

  // 프로젝트 등록(생성) 버튼 클릭 시 템플릿 페이지로 이동하는 함수
  const handleNewProject = () => {
    router.push('/new-project'); // '/new-project' 페이지로 이동
  };

  // 프로젝트 목록 상태 관리 (초기값 빈 배열)
  const [projects, setProjects] = useState<ProjectData[]>([]);
  // 데이터 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 오류 상태 관리
  const [error, setError] = useState<string | null>(null);

  // 컴포넌트가 마운트될 때 (페이지 로딩 시) API 호출하여 데이터 가져오기
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true); // 로딩 시작
      setError(null); // 오류 초기화

      try {
        // TODO: 백엔드 API 라우트 URL로 변경
        const response = await fetch('/api/projects/dashboard_projects', {
          // 백엔드 API 호출
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // 필요한 경우 인증 헤더 추가
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `HTTP error! status: ${response.status}, body: ${errorBody}`
          );
          throw new Error(
            `프로젝트 목록을 가져오는 데 실패했습니다. 상태 코드: ${response.status}`
          );
        }

        // API 응답 데이터 파싱 (ProjectData[] 타입)
        const data: ProjectData[] = await response.json();
        setProjects(data); // 프로젝트 목록 상태 업데이트
      } catch (err: unknown) {
        console.error('프로젝트 목록 가져오기 실패:', err);
        setError(
          err instanceof Error
            ? err.message
            : '프로젝트 목록을 가져오는 중 오류 발생'
        );
        setProjects([]); // 오류 발생 시 목록 비우기
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    fetchProjects(); // API 호출 함수 실행
  }, []); // 의존성 배열이 비어 있으므로 컴포넌트가 처음 마운트될 때만 실행

  // 프로젝트 카드 클릭 시 상세 페이지로 이동 (파라미터 전달)
  // DB에서 가져온 project 객체에는 id가 포함되어 있으므로 name 대신 id를 파라미터로 사용할 수도 있습니다.
  // 예: onClick={() => handleProjectDetail(project.id)} -> router.push(`/project/${id}`)
  // 상세 페이지 라우트도 pages/project/[id].tsx 로 변경 필요
  const handleProjectDetail = (name: string) => {
    router.push(`/project/${name}`); // '/project/[name]' 페이지로 이동
  };

  // 로딩 중 상태 표시
  if (isLoading) {
    return <div>프로젝트 목록을 로딩 중입니다...</div>;
  }

  // 오류 상태 표시
  if (error) {
    return <div>오류: {error}</div>;
  }

  // 프로젝트 목록 데이터가 비어 있을 경우 메시지 표시
  //if (projects.length === 0) {
  // 로딩도 끝났고 오류도 없는데 목록이 비어 있다면 DB에 데이터가 없는 것일 수 있습니다.
  // return <div>프로젝트가 없습니다.</div>;
  //}

  // 프로젝트 목록 데이터를 사용하여 UI 렌더링
  return (
    <div className={styles.container}>
      {/* 전체 프로젝트 목록 조회 UI */}
      <main className={styles.main}>
        <h1 className={styles.title}>Current Projects</h1>
        <div className={styles.projectList}>
          {/* ------------------------------------ */}
          {/* DB에서 받아온 projects 상태를 사용하여 목록 렌더링 */}
          {/* key는 이제 project.id를 사용하는 것이 더 안전하고 고유합니다. */}
          {projects.map((project) => (
            <div
              key={project.id} // project.name 대신 project.id 사용 권장
              className={styles.projectCard}
              style={{ cursor: 'pointer' }}
              onClick={() => handleProjectDetail(project.name)} // 상세 페이지 이동은 name으로 유지
              title="상세 페이지로 이동"
            >
              <div className={styles.projectInfo}>
                <div className={styles.projectName}>{project.name}</div>
              </div>
              {/* 배포 상태별 아이콘 (승인/보류/실패) */}
            </div>
          ))}
          {/* ------------------------------------ */}
        </div>
        {/* 필터링, 로그 등 추가 UI (변경 없음) */}
        <div className={styles.btnGroup}>
          {/* 프로젝트 등록(생성) 버튼 */}
          <button className={styles.createBtn} onClick={handleNewProject}>
            프로젝트 등록
          </button>
        </div>
      </main>
    </div>
  );
}
