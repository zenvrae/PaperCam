import mysql from 'mysql2/promise';

// Create a connection pool (reused across serverless invocations)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 5000,
  // Required for many cloud-hosted MySQL servers
  ssl: { rejectUnauthorized: false }
});

// Helper to execute MySQL queries with automatic retries on ECONNRESET / pool socket disconnects
export async function queryWithRetry<T = any>(sql: string, params?: any[], retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T;
    } catch (err: any) {
      const isConnError = 
        err.code === 'ECONNRESET' || 
        err.code === 'PROTOCOL_CONNECTION_LOST' || 
        (err.message && err.message.includes('read ECONNRESET'));
        
      if (isConnError && attempt < retries) {
        console.warn(`[DB] MySQL connection reset (${err.code || 'ECONNRESET'}). Retrying query (attempt ${attempt + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, 300));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Database query failed after retries');
}

// Auto-create students table on first use
let tableCreated = false;

export async function ensureStudentsTable() {
  if (tableCreated) return;
  
  try {
    await queryWithRetry(`
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
  } catch (err: any) {
    console.error('[DB] Failed to ensure students table:', err?.message || err);
  }
}

export default pool;

