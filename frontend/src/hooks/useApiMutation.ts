import { useState, useCallback } from 'react';
import { ApiErrorResponse } from '../types/api';

export interface UseApiMutationOptions<TPayload, TResult> {
  mutationFn: (payload: TPayload) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: ApiErrorResponse) => void;
}

export interface UseApiMutationReturn<TPayload, TResult> {
  mutate: (payload: TPayload) => Promise<void>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
  data: TResult | null;
  reset: () => void;
}

/**
 * useApiMutation
 * Generic mutation hook for non-TanStack form submissions and imperative API calls.
 * Used for: login, logout, create order, etc.
 */
export function useApiMutation<TPayload, TResult>(
  options: UseApiMutationOptions<TPayload, TResult>
): UseApiMutationReturn<TPayload, TResult> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const mutate = useCallback(
    async (payload: TPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await options.mutationFn(payload);
        setData(result);
        options.onSuccess?.(result);
      } catch (err) {
        const apiError = err as ApiErrorResponse;
        setError(apiError);
        options.onError?.(apiError);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { mutate, isLoading, error, data, reset };
}
