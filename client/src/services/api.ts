import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 - token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { token } = response.data;

        localStorage.setItem('auth_token', token);
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post('/auth/register', { name, email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  getMe: () =>
    apiClient.get('/auth/me'),

  logout: () =>
    apiClient.post('/auth/logout'),
};

// ============================================================================
// Jobs API
// ============================================================================

export interface JobsQueryParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export const jobsApi = {
  getAll: (params?: JobsQueryParams) =>
    apiClient.get('/jobs', { params }),

  getById: (id: string) =>
    apiClient.get(`/jobs/${id}`),

  create: (data: any) =>
    apiClient.post('/jobs', data),

  update: (id: string, data: any) =>
    apiClient.patch(`/jobs/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/jobs/${id}`),
};

// ============================================================================
// Candidates API
// ============================================================================

export interface CandidatesQueryParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export const candidatesApi = {
  getAll: (params?: CandidatesQueryParams) =>
    apiClient.get('/candidates', { params }),

  getById: (id: string) =>
    apiClient.get(`/candidates/${id}`),

  create: (data: any) =>
    apiClient.post('/candidates', data),

  update: (id: string, data: any) =>
    apiClient.patch(`/candidates/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/candidates/${id}`),
};

// ============================================================================
// Interviews API
// ============================================================================

export interface InterviewsQueryParams {
  limit?: number;
  offset?: number;
}

export const interviewsApi = {
  getAll: (params?: InterviewsQueryParams) =>
    apiClient.get('/interviews', { params }),

  getUpcoming: () =>
    apiClient.get('/interviews/upcoming'),

  getById: (id: string) =>
    apiClient.get(`/interviews/${id}`),

  create: (data: any) =>
    apiClient.post('/interviews', data),

  update: (id: string, data: any) =>
    apiClient.patch(`/interviews/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/interviews/${id}`),
};

// ============================================================================
// Notifications API
// ============================================================================

export interface NotificationsQueryParams {
  limit?: number;
  offset?: number;
}

export const notificationsApi = {
  getAll: (params?: NotificationsQueryParams) =>
    apiClient.get('/notifications', { params }),

  getUnread: () =>
    apiClient.get('/notifications/unread'),

  getById: (id: string) =>
    apiClient.get(`/notifications/${id}`),

  create: (data: any) =>
    apiClient.post('/notifications', data),

  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.patch('/notifications/mark-all-read'),

  delete: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
};

// ============================================================================
// Activities API
// ============================================================================

export interface ActivitiesQueryParams {
  limit?: number;
  offset?: number;
}

export const activitiesApi = {
  getAll: (params?: ActivitiesQueryParams) =>
    apiClient.get('/activities', { params }),

  getRecent: (limit?: number) =>
    apiClient.get('/activities/recent', { params: { limit } }),

  getById: (id: string) =>
    apiClient.get(`/activities/${id}`),
};

// ============================================================================
// Error Handling Utilities
// ============================================================================

export interface ApiErrorResponse {
  error: string;
  details?: any;
}

export function isApiError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError(error);
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.response?.data?.error || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export default apiClient;
