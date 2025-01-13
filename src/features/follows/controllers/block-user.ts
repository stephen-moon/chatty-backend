import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowCache } from '@services/redis/follow.cache';
import { blockUserQueue } from '@services/queues/block.queue';

const followCache: FollowCache = new FollowCache();

export class AddUser {
  public async block(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockUser(followerId, req.currentUser!.userId, 'block');
    blockUserQueue.addBlockUserJob('addBlockUserToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'block'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'User blocked' });
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    AddUser.prototype.updateBlockUser(followerId, req.currentUser!.userId, 'unblock');
    blockUserQueue.addBlockUserJob('removeBlockUserFromDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followerId}`,
      type: 'unblock'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'User unblocked' });
  }

  private async updateBlockUser(followerId: string, userId: string, type: 'block' | 'unblock'): Promise<void> {
    const blocked: Promise<void> = followCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${followerId}`, type);
    const blockedBy: Promise<void> = followCache.updateBlockedUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);
    await Promise.all([blocked, blockedBy]);
  }
}
