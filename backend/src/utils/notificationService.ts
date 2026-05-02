import { NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

interface NotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message?: string;
  payload?: Prisma.InputJsonValue;
}

export class NotificationService {
  static async notifyUser(input: NotificationInput) {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        payload: input.payload ?? {},
      },
    });
  }

  static async notifyAdmins(input: Omit<NotificationInput, 'userId'>) {
    const admins = await prisma.user.findMany({
      where: { role: 'administrator', status: 'active' },
      select: { id: true },
    });

    if (!admins.length) return;

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: input.type,
        title: input.title,
        message: input.message,
        payload: input.payload ?? {},
      })),
    });
  }
}
