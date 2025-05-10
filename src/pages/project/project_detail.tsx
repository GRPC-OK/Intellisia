// pages/project/[name].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// 상세 페이지용 CSS 모듈 (필요하다면 생성)
// import styles from "../../styles/ProjectDetail.module.css";

// API 응답으로 받을 프로젝트 데이터의 타입을 정의합니다.
// 실제 API 응답 구조에 맞게 필드를 조정해야 합니다.
interface ProjectData {
  name: string;
  path: string;
  size: string; // 또는 number
  icon: string;
  status: "approved" | "pending" | "failed" | string;
  sync: string;
  health: string;
  lastLog: string; // 또는 Date 타입
  // TODO: 실제 프로젝트 상세 정보 필드를 여기에 추가하세요.
}

export default function ProjectDetail() {
  const router = useRouter();
  // URL 파라미터에서 'name' 값을 가져옵니다. (예: /project/MyProject 에서 "MyProject"를 가져옴)
  // router.query는 처음에는 비어있을 수 있으므로 타입 단언 또는 체크가 필요합니다.
  const { name } = router.query as { name?: string }; // 'name' 파라미터가 있을 수 있음을 명시

  // 프로젝트 상세 정보 상태 관리
  const [project, setProject] = useState<ProjectData | null>(null);
  // 데이터 로딩 상태 관리
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // 오류 상태 관리
  const [error, setError] = useState<string | null>(null);

  // 'name' URL 파라미터가 변경될 때마다 API 요청을 실행합니다.
  useEffect(() => {
    // name 값이 아직 유효하지 않으면 (페이지 초기 로드 시 등) API 요청을 보내지 않음
    if (!name) {
      setIsLoading(false); // name이 없을 때는 로딩 종료
      return;
    }

    // API 요청을 비동기적으로 수행하는 함수 정의
    const fetchProjectDetail = async () => {
      setIsLoading(true); // 로딩 시작
      setError(null); // 이전 오류 초기화
      setProject(null); // 이전 프로젝트 데이터 초기화

      try {
        // TODO: 실제 프로젝트 상세 API 엔드포인트 URL로 변경해야 합니다.
        // '/api/projects/${name}'는 Next.js API Routes를 사용하는 예시입니다.
        console.log(`Workspaceing project detail for: ${name}`); // 콘솔 로그 출력
        const response = await fetch(`/api/projects/${name}`, {
          method: 'GET', // GET 요청임을 명시
          headers: {
            'Content-Type': 'application/json',
            // 필요한 경우 인증 헤더 등을 추가합니다.
            // 'Authorization': `Bearer YOUR_AUTH_TOKEN`,
          },
        }); // <-- 실제 서버 API로 GET 요청

        // HTTP 응답 상태 코드 확인
        if (!response.ok) {
          // 오류 발생 시 상태 코드와 메시지를 로깅하고 오류 상태 업데이트
          const errorBody = await response.text(); // 또는 response.json()
          console.error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
          throw new Error(`데이터를 가져오는 데 실패했습니다. 상태 코드: ${response.status}`);
        }

        // JSON 응답 파싱
        const data: ProjectData = await response.json(); // <-- 서버로부터 받은 상세 데이터

        // 받아온 데이터로 상태 업데이트
        setProject(data);

      } catch (err: any) {
        // API 요청 중 발생한 예외 처리
        console.error("프로젝트 상세 정보 가져오기 실패:", err);
        setError(err.message || "프로젝트 정보를 가져오는 중 알 수 없는 오류 발생"); // 오류 상태 업데이트
        setProject(null); // 오류 발생 시 프로젝트 데이터 초기화

      } finally {
        // 로딩 상태 종료 (성공/실패 여부와 관계없이)
        setIsLoading(false);
      }
    };

    // API 요청 함수 실행
    fetchProjectDetail();

  }, [name]); // 'name' URL 파라미터 값이 변경될 때마다 이 useEffect 훅을 다시 실행

  // 로딩 중 상태 표시
  if (isLoading) {
    return <div>프로젝트 상세 정보를 로딩 중입니다...</div>;
  }

  // 오류 상태 표시
  if (error) {
    return <div>오류: {error}</div>;
  }

  // 프로젝트 데이터를 찾지 못한 경우 또는 응답이 비어있는 경우 처리 (API 구현에 따라 로직 변경)
  // 예를 들어, API가 404 Not Found를 반환한다면 위 response.ok 체크에서 걸러집니다.
  // API가 200 OK를 반환했지만 데이터가 없는 경우라면 project 상태가 null일 수 있습니다.
  if (!project) {
     // name은 있으나 프로젝트 정보가 서버에 없는 경우
     return <div>프로젝트 정보를 찾을 수 없습니다: "{name}"</div>;
  }

  // 프로젝트 상세 정보가 성공적으로 로드되었을 때 UI 렌더링
  return (
    // <div className={styles.container}> {/* 상세 페이지 스타일 적용 */}
    <div>
      <h1>프로젝트 상세 정보: {project.name}</h1>
      <p>경로: {project.path}</p>
      <p>크기: {project.size}</p>
      {/* 가져온 project 객체의 다른 필드들을 사용하여 상세 정보를 표시합니다. */}
      {/* 예: <p>동기화 상태: {project.sync}</p> */}

      {/* TODO: 이 프로젝트의 상세 대시보드 (로그 목록, 상태 변화 그래프 등) UI를 구현합니다. */}

      {/* 뒤로가기 버튼 */}
      <button onClick={() => router.back()}>뒤로가기</button>
    </div>
  );
}