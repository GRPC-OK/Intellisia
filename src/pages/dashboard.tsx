import React from "react";
import { useRouter } from "next/router";
import styles from "../styles/Dashboard.module.css";

// 프로젝트 상태별 아이콘 컴포넌트
const StatusIcon = ({ status }: { status: string }) => {
  if (status === "approved") {
    return <span title="승인" style={{ color: '#22c55e', fontSize: '1.5rem' }}>✔️</span>;
  } else if (status === "pending") {
    return <span title="보류" style={{ color: '#eab308', fontSize: '1.5rem' }}>▲</span>;
  } else {
    return <span title="실패" style={{ color: '#ef4444', fontSize: '1.5rem' }}>✖️</span>;
  }
};

// 예시 프로젝트 데이터 (상태, 동기화, 헬스, 최근 배포 로그 등 포함)
const projects = [
  {
    name: "Project 1",
    path: "acme-ai/website",
    size: "2.5MB",
    icon: "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
    status: "approved",
    sync: "Synced",
    health: "Healthy",
    lastLog: "2024-06-01 14:22:10 배포 성공"
  },
  {
    name: "Project 2",
    path: "acme-ai/website",
    size: "1.2MB",
    icon: "https://cdn-icons-png.flaticon.com/512/1055/1055672.png",
    status: "pending",
    sync: "OutOfSync",
    health: "Degraded",
    lastLog: "2024-06-01 13:10:05 승인 대기"
  },
  {
    name: "Project 3",
    path: "acme-ai/website",
    size: "3.1MB",
    icon: "https://cdn-icons-png.flaticon.com/512/1055/1055676.png",
    status: "failed",
    sync: "Synced",
    health: "Missing",
    lastLog: "2024-05-31 19:44:22 배포 실패"
  },
];

export default function Dashboard() {
  const router = useRouter();

  // 프로젝트 등록(생성) 버튼 클릭 시 템플릿 페이지로 이동
  const handleNewProject = () => {
    router.push("/new-project"); // '/new-project' 페이지로 이동
  };

  // 프로젝트 카드 클릭 시 상세 페이지로 이동 (파라미터 전달)
  const handleProjectDetail = (name: string) => {
    router.push(`/project/${name}`); // '/project/[name]' 페이지로 이동
  };

  return (
    <div className={styles.container}>
      {/* 상단 네비게이션 */}
      <nav className={styles.nav}>
        <div className={styles.logo}>Acme AI</div>
        <div className={styles.menu}>
          <a href="#">Dashboard</a>
          <a href="#">Blueprints</a>
          <a href="#">Env Groups</a>
          <a href="#">Docs</a>
          <a href="#">Community</a>
          <a href="#">Help</a>
        </div>
        <div className={styles.navRight}>
          {/* 프로젝트 등록(생성) 버튼 */}
          <button className={styles.newBtn} onClick={handleNewProject}>New</button>
          <div className={styles.profile}>
            <span>●</span>
          </div>
        </div>
      </nav>

      {/* 전체 프로젝트 목록 조회 UI */}
      <main className={styles.main}>
        <h1 className={styles.title}>Current Projects</h1>
        <div className={styles.projectList}>
          {/* 프로젝트 간략 정보 UI 및 상세 페이지로 이동 */}
          {projects.map((project) => (
            <div
              key={project.name}
              className={styles.projectCard}
              style={{ cursor: 'pointer' }}
              onClick={() => handleProjectDetail(project.name)}
              title="상세 페이지로 이동"
            >
              <img src={project.icon} alt={project.name} className={styles.projectIcon} />
              <div className={styles.projectInfo}>
                <div className={styles.projectName}>{project.name}</div>
                <div className={styles.projectPath}>{project.path}</div>
                {/* 동기화 상태, 헬스체크 정보 UI */}
                <div style={{ fontSize: '0.9rem', color: '#b0b8c1', marginTop: 2 }}>
                  동기화: {project.sync} | 헬스: {project.health}
                </div>
                {/* 최근 배포 로그 */}
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 2 }}>
                  최근 배포: {project.lastLog}
                </div>
              </div>
              {/* 배포 상태별 아이콘 (승인/보류/실패) */}
              <div className={styles.projectSize} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {project.size}
                <StatusIcon status={project.status} />
              </div>
            </div>
          ))}
        </div>
        {/* 필터링, 로그 등 추가 UI는 추후 구현 가능 */}
        <div className={styles.btnGroup}>
          <button className={styles.cancelBtn}>Cancel</button>
          {/* 프로젝트 등록(생성) 버튼 */}
          <button className={styles.createBtn} onClick={handleNewProject}>프로젝트 등록</button>
        </div>
      </main>
    </div>
  );
} 