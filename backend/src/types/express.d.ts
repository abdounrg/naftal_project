import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: UserRole;
        districtId: number | null;
        structureId: number | null;
      };
    }
  }
}

export {};
