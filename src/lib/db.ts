import mysql from 'mysql2/promise';

// Create a connection pool (reused across serverless invocations)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000,
  // Required for many cloud-hosted MySQL servers
  ssl: { rejectUnauthorized: false }
});

// Auto-create students table on first use
let tableCreated = false;

export async function ensureStudentsTable() {
  if (tableCreated) return;
  
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(255) NOT NULL DEFAULT '',
        email VARCHAR(255) NOT NULL DEFAULT '',
        phone VARCHAR(50) NOT NULL DEFAULT '',
        district VARCHAR(100) NOT NULL DEFAULT 'Thiruvananthapuram',
        qualification VARCHAR(255) NOT NULL DEFAULT 'Graduate',
        dob VARCHAR(20) NOT NULL DEFAULT '',
        age VARCHAR(20) NOT NULL DEFAULT '',
        registered_date VARCHAR(20) NOT NULL DEFAULT '',
        avatar TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Pending Onboarding',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    tableCreated = true;
  } finally {
    conn.release();
  }
}

export default pool;
