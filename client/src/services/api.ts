import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
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
  login: (email: string, password: string) => {
    console.log('Calling login API with:', { email });
    return apiClient.post('/auth/login', { email, password })
      .then(res => {
        console.log('Login API response:', res.data);
        return res;
      });
  },

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

  /**
   * Match candidate to a job
   * Calculates job match scores between candidate and job
   */
  matchJob: (candidateId: string, jobId: string) =>
    apiClient.post(`/candidates/${candidateId}/match-job/${jobId}`),
};

// ============================================================================
// Client Jobs API (Public job browsing for job seekers)
// ============================================================================

export interface ClientJobsQueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  location?: string;
  type?: string;
  skills?: string[];
  postedAfter?: string;
}

export const clientJobsApi = {
  /**
   * Get available jobs for client job browsing
   * Filters to only "open" jobs
   * Client sees all available positions across all employers
   */
  browse: (params?: ClientJobsQueryParams) => {
    const browseParams = {
      limit: params?.limit || 50,
      offset: params?.offset || 0,
      status: 'open',
      search: params?.search,
      location: params?.location,
      type: params?.type,
      skills: params?.skills?.join(','),
      postedAfter: params?.postedAfter,
    };
    // Remove undefined params
    Object.keys(browseParams).forEach(key => 
      (browseParams as any)[key] === undefined && delete (browseParams as any)[key]
    );
    return apiClient.get('/jobs', { params: browseParams });
  },

  /**
   * Get a specific job for client viewing
   * Only shows public information
   */
  getById: (id: string) =>
    apiClient.get(`/jobs/${id}`),

  /**
   * Apply to a job as a client
   * Creates a candidate record with job_id
   */
  apply: (data: {
    name: string;
    email: string;
    phone: string;
    location: string;
    jobId: string;
    resumeUrl?: string;
    linkedIn?: string;
    portfolio?: string;
  }) =>
    apiClient.post('/candidates', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      location: data.location,
      jobId: data.jobId,
      resumeUrl: data.resumeUrl,
      linkedin: data.linkedIn,
      portfolio: data.portfolio,
      status: 'applied',
    }),
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

  /**
   * Get interviews for a specific candidate
   * For client-side use: fetches interviews where the candidate is the user's own profile
   */
  getByCandidateId: (candidateId: string) =>
    apiClient.get('/interviews', {
      params: { candidateId },
    }),

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

export { apiClient as api };
export default apiClient;
