// types/pagination.ts
export interface CursorPaginationQuery {
  cursor?: string;
  limit?: string;
  direction?: 'next' | 'prev';
}

export interface CursorPaginationResponse<T> {
  data: T[];
  pagination: {
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
    count: number;
  };
}