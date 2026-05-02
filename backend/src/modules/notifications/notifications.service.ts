import { NotificationStatus, Prisma, SupportRequestStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/appError';
import { buildPaginationMeta, parsePagination } from '../../utils/pagination';
import { NotificationService } from '../../utils/notificationService';
import { UpdateSupportRequestInput } from './notifications.validators';

export class NotificationsService {
  static async listMine(userId: number, query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const where: Prisma.NotificationWhereInput = { userId };
    if (query.status) where.status = query.status as NotificationStatus;

    const [data, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, status: 'unread' } }),
    ]);

    return {
      data,
      meta: {
        ...buildPaginationMeta(total, page, per_page),
        unreadCount,
      },
    };
  }

  static async markRead(userId: number, id: number) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw AppError.notFound('Notification not found');
    }

    return prisma.notification.update({
      where: { id },
      data: { status: 'read', readAt: new Date() },
    });
  }

  static async markAllRead(userId: number) {
    await prisma.notification.updateMany({
      where: { userId, status: 'unread' },
      data: { status: 'read', readAt: new Date() },
    });
  }

  static async listSupportRequests(query: any) {
    const { skip, take, page, per_page } = parsePagination(query);

    const where: Prisma.LoginSupportRequestWhereInput = {};
    if (query.status) where.status = query.status as SupportRequestStatus;

    const [data, total] = await Promise.all([
      prisma.loginSupportRequest.findMany({
        where,
        include: {
          createdByUser: { select: { id: true, name: true, email: true } },
          assignedAdmin: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.loginSupportRequest.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(total, page, per_page) };
  }

  static async updateSupportRequest(id: number, adminUserId: number, input: UpdateSupportRequestInput) {
    const existing = await prisma.loginSupportRequest.findUnique({ where: { id } });
    if (!existing) throw AppError.notFound('Support request not found');

    const data: Prisma.LoginSupportRequestUpdateInput = {
      status: input.status,
      adminNotes: input.adminNotes,
      assignedAdmin: { connect: { id: adminUserId } },
    };

    if (input.status === 'resolved' || input.status === 'rejected') {
      data.resolvedAt = new Date();
    }

    const updated = await prisma.loginSupportRequest.update({
      where: { id },
      data,
      include: {
        createdByUser: { select: { id: true, name: true, email: true } },
      },
    });

    if (updated.createdByUserId) {
      await NotificationService.notifyUser({
        userId: updated.createdByUserId,
        type: 'login_support_request',
        title: `Support request ${updated.status}`,
        message: `Your login support request has been marked as ${updated.status}`,
        payload: { requestId: updated.id, status: updated.status },
      });
    }

    return updated;
  }
}
