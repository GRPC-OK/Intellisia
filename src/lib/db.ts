import { Pool } from 'pg';

// 환경 변수에서 데이터베이스 설정을 가져옵니다
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'password123', // 실제 비밀번호로 변경해주세요
  port: 5432,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
