import { PaginationQuery, PaginatedResult } from '../types/common.types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const parsePagination = (query: PaginationQuery) => {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const buildPaginatedResult = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> => ({
  items,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});
