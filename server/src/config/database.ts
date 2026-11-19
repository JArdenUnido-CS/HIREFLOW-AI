import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hireflow_ai',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_POOL_MAX || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

// Test connection on startup
pool.getConnection()
  .then((connection: any) => {
    console.log('✓ MySQL Database connection successful');
    connection.release();
  })
  .catch((error: any) => {
    console.error('✗ Database connection failed:', error.message);
    console.error('Make sure MySQL is running at', `${process.env.DB_HOST}:${process.env.DB_PORT}`);
  });

export default pool;
export const isMongoDb = false;
export const mongoDb = null;
export const mongoClient = null;
