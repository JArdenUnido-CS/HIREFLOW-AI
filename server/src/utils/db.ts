import { RowDataPacket, OkPacket } from 'mysql2/promise';
import pool from '@/config/database.js';

/**
 * Execute a SELECT query
 */
export async function query<T extends RowDataPacket[]>(
  sql: string,
  values?: any[]
): Promise<T> {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(sql, values);
      return rows as T;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute an INSERT, UPDATE, or DELETE query
 */
export async function execute(
  sql: string,
  values?: any[]
): Promise<OkPacket> {
  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(sql, values);
      return result as OkPacket;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Get single row from query
 */
export async function queryOne<T extends RowDataPacket>(
  sql: string,
  values?: any[]
): Promise<T | null> {
  const results = await query<T[]>(sql, values);
  return results.length > 0 ? results[0] : null;
}

/**
 * Check if a record exists
 */
export async function exists(sql: string, values?: any[]): Promise<boolean> {
  const result = await queryOne(sql, values);
  return !!result;
}
