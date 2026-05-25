export interface ApiResponse<T = unknown> {
  success: boolean;
  status_code: number;
  data?: T;
  message?: string;
  error_code?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
