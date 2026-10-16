/**
 * Mock Database Query Layer
 * Simulates SQL queries using in-memory mock data
 */

import { mockDB, getMockData, getMockDataOne } from '../config/database.js';

/**
 * Execute a SELECT query (returns array)
 */
export async function query<T extends any[]>(
  sql: string,
  values?: any[]
): Promise<T> {
  // Parse simple SELECT queries
  if (sql.includes('FROM users')) {
    return getMockData('users') as T;
  } else if (sql.includes('FROM jobs')) {
    return getMockData('jobs') as T;
  } else if (sql.includes('FROM candidates')) {
    return getMockData('candidates') as T;
  } else if (sql.includes('FROM interviews')) {
    return getMockData('interviews') as T;
  }
  return [] as T;
}

/**
 * Execute an INSERT, UPDATE, or DELETE (mock implementation)
 */
export async function execute(
  sql: string,
  values?: any[]
): Promise<any> {
  // Mock successful execution
  return {
    affectedRows: 1,
    insertId: Math.random().toString(36).substr(2, 9),
  };
}

/**
 * Get single row from query
 */
export async function queryOne<T extends any>(
  sql: string,
  values?: any[]
): Promise<T | null> {
  // Parse simple SELECT queries
  if (sql.includes('FROM users') && sql.includes('WHERE')) {
    if (sql.includes('email')) {
      const email = values?.[0];
      const user = getMockDataOne('users', { email });
      return user as T | null;
    } else if (sql.includes('id')) {
      const id = values?.[0];
      const user = getMockDataOne('users', { id });
      return user as T | null;
    }
  }
  return null;
}

/**
 * Check if a record exists
 */
export async function exists(sql: string, values?: any[]): Promise<boolean> {
  const result = await queryOne(sql, values);
  return !!result;
}

/**
 * Execute a transaction (mock)
 */
export async function transaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  return callback(null);
}
