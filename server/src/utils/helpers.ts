import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a prefixed ID for specific entity types
 */
export function generateEntityId(prefix: 'usr' | 'job' | 'cand' | 'int' | 'act' | 'notif'): string {
  return `${prefix}_${Date.now().toString(36)}`;
}

/**
 * Handle API errors
 */
export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export function createApiError(status: number, message: string, details?: any): ApiError {
  return {
    status,
    message,
    details,
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(json: any, defaultValue: any = null): any {
  if (typeof json === 'string') {
    try {
      return JSON.parse(json);
    } catch {
      return defaultValue;
    }
  }
  return json || defaultValue;
}

/**
 * Safe JSON stringify
 */
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}
