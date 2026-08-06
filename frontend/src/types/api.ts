/**
  * Standard Laravel API Response Wrapper
  */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: ApiPaginationMeta;
}

export interface ApiMeta {
  timestamp: string;
  version?: string;
}

export interface ApiPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status_code?: number;
}
