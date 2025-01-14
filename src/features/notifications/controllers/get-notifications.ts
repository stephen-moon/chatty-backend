import { INotificationDocument } from '@notifications/interfaces/notification.interface';
import { notificationService } from '@services/db/notification.service';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

export class Get {
  public async notifications(req: Request, res: Response): Promise<void> {
    const notifications: INotificationDocument[] = await notificationService.getNotifications(req.currentUser!.userId);

    res.status(HTTP_STATUS.OK).json({ message: 'User notifications.', notifications });
  }
}
