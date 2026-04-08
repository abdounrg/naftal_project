import { Response } from 'express';

interface PaginatedMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json({ success: true, data });
  }

  static created<T>(res: Response, data: T) {
    return res.status(201).json({ success: true, data });
  }

  static paginated<T>(res: Response, data: T[], meta: PaginatedMeta) {
    return res.status(200).json({ success: true, data, meta });
  }

  static error(res: Response, message: string, statusCode = 400, errors?: unknown) {
    return res.status(statusCode).json({ success: false, message, ...(errors ? { errors } : {}) });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}
