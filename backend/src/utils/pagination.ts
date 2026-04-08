import { CONSTANTS } from '../config/constants';

export interface PaginationParams {
  page: number;
  per_page: number;
  skip: number;
  take: number;
}

export function parsePagination(query: { page?: string; per_page?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const per_page = Math.min(
    CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.per_page || String(CONSTANTS.DEFAULT_PAGE_SIZE), 10) || CONSTANTS.DEFAULT_PAGE_SIZE)
  );
  return { page, per_page, skip: (page - 1) * per_page, take: per_page };
}

export function buildPaginationMeta(total: number, page: number, per_page: number) {
  return { total, page, per_page, total_pages: Math.ceil(total / per_page) || 1 };
}

export function parseSorting(
  query: { sort_by?: string; sort_order?: string },
  allowedFields: string[],
  defaultField = 'createdAt'
): { orderBy: Record<string, 'asc' | 'desc'> } {
  const field = allowedFields.includes(query.sort_by || '') ? query.sort_by! : defaultField;
  const direction = query.sort_order === 'asc' ? 'asc' : 'desc';
  return { orderBy: { [field]: direction } };
}
