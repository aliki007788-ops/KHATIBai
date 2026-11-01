/**
 * Backend (FastAPI) returns models directly — no { success, data } wrapper.
 * Errors typically: { detail: string } or { detail: ValidationError[] }
 */

export interface ApiErrorBody {
  detail?: string | Array<{ loc: (string | number)[]; msg: string; type: string }>;
}

export interface PaginatedMeta {
  total?: number;
  page?: number;
  page_size?: number;
}
