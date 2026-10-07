import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import { getErrorMessage } from '@/services/api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiCallbacks<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for handling API calls with loading and error states
 */
export function useApi<T>(
  apiCall: () => Promise<any>,
  callbacks?: UseApiCallbacks<T>
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await apiCall();
      setState({ data: response.data, loading: false, error: null });
      callbacks?.onSuccess?.(response.data);
    } catch (error) {
      const message = getErrorMessage(error);
      setState({ data: null, loading: false, error: message });
      callbacks?.onError?.(message);
    }
  }, [apiCall, callbacks]);

  // Auto-fetch on mount
  useEffect(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    refetch: execute,
  };
}

/**
 * Hook for handling paginated API calls
 */
export function usePaginatedApi<T>(
  apiCall: (limit: number, offset: number) => Promise<any>,
  initialLimit: number = 50
): UseApiState<T[]> & {
  limit: number;
  offset: number;
  hasMore: boolean;
  refetch: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
} {
  const [state, setState] = useState<UseApiState<T[]>>({
    data: [],
    loading: false,
    error: null,
  });
  const [limit] = useState(initialLimit);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const execute = useCallback(async (newOffset: number) => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const response = await apiCall(limit, newOffset);
      setState({
        data: response.data.data || response.data,
        loading: false,
        error: null,
      });
      setTotal(response.data.total || response.data.length);
      setOffset(newOffset);
    } catch (error) {
      const message = getErrorMessage(error);
      setState((s) => ({ ...s, loading: false, error: message }));
    }
  }, [apiCall, limit]);

  useEffect(() => {
    execute(0);
  }, [execute]);

  return {
    ...state,
    limit,
    offset,
    hasMore: offset + limit < total,
    refetch: () => execute(offset),
    goToPage: (page: number) => execute(page * limit),
    nextPage: () => execute(offset + limit),
    prevPage: () => execute(Math.max(0, offset - limit)),
  };
}

/**
 * Hook for handling API mutations (POST, PATCH, DELETE)
 */
export function useMutation<T, V = any>(
  apiCall: (data: V) => Promise<any>,
  callbacks?: UseApiCallbacks<T>
): {
  execute: (data: V) => Promise<T>;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(
    async (data: V): Promise<T> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await apiCall(data);
        setSuccess(true);
        setLoading(false);
        callbacks?.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        setLoading(false);
        callbacks?.onError?.(message);
        throw err;
      }
    },
    [apiCall, callbacks]
  );

  return {
    execute,
    loading,
    error,
    success,
    reset: () => {
      setLoading(false);
      setError(null);
      setSuccess(false);
    },
  };
}
