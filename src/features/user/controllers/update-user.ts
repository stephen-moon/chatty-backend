import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { userQueue } from '@services/queues/user.queue';
import { UserCache } from '@services/redis/user.cache';
import { basicInfoSchema, notificationSettingsSchema, socialLinksSchema } from '@user/schemes/info';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

const userCache: UserCache = new UserCache();

export class Update {
  @joiValidation(basicInfoSchema)
  public async info(req: Request, res: Response): Promise<void> {
    for (const [key, value] of Object.entries(req.body)) {
      await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, key, `${value}`);
    }
    userQueue.addUserJob('updateBasicInfoInDB', {
      key: `${req.currentUser!.userId}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }

  @joiValidation(socialLinksSchema)
  public async social(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'social', req.body);
    userQueue.addUserJob('updateSocialLinksInDB', {
      key: `${req.currentUser!.userId}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Updated successfully' });
  }

  @joiValidation(notificationSettingsSchema)
  public async notificationSettings(req: Request, res: Response): Promise<void> {
    await userCache.updateSingleUserItemInCache(`${req.currentUser!.userId}`, 'notifications', req.body);
    userQueue.addUserJob('updateNotificationSettings', {
      key: `${req.currentUser!.userId}`,
      value: req.body
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Notification settings updated successfully', settings: req.body });
  }
}
