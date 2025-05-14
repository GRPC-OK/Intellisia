// pages/api/projects/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

// DB에서 가져올 프로젝트 데이터의 타입 (schema.prisma 모델과 일치해야 함)
interface ProjectData {
  id: number; // DB에서 기본 키로 사용 (프론트엔드에서는 name을 key로 사용했지만 DB에서는 id가 고유 키)
  name: string;
  path: string;
  size?: string | null;
  icon?: string | null;
  status: string;
  sync: string;
  health: string;
  lastLog?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // TODO: 필요한 다른 필드 추가
}

// API 응답 데이터에 대한 타입 정의 (프로젝트 목록 또는 오류 메시지)
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProjectData[] | { message: string; error?: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 데이터베이스 연결 테스트
    const client = await pool.connect();
    console.log('Database connection successful');

    try {
      // 모든 프로젝트 조회
      const query = `
        SELECT 
          id,
          name,
          path,
          size,
          icon,
          status,
          sync,
          health,
          last_log as "lastLog",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM projects
        ORDER BY id DESC
      `;

      console.log('Executing query:', query);
      const result = await client.query(query);
      console.log('Query result:', result.rows);

      return res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Detailed error:', error);
    return res.status(500).json({
      message: '프로젝트 목록을 가져오는 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
