import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, path, size, icon, status, sync, health, lastLog } = req.body;

    // SQL 쿼리 작성
    const query = `
      INSERT INTO projects (name, path, size, icon, status, sync, health, last_log)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    // 쿼리 실행
    const result = await pool.query(query, [name, path, size, icon, status, sync, health, lastLog]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: '프로젝트 생성 중 오류가 발생했습니다.' });
  }
}
