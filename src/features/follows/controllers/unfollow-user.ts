import { FollowCache } from '@services/redis/follow.cache';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { followQueue } from '@services/queues/follow.queue';

const followCache: FollowCache = new FollowCache();

export class Remove {
  public async follow(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;

    const removeFollowerFromCache: Promise<void> = followCache.removeFollowFromCache(`following:${req.currentUser!.userId}`, followeeId);
    const removeFolloweeFromCache: Promise<void> = followCache.removeFollowFromCache(
      `followers:${followeeId}`,
      `${req.currentUser!.userId}`
    );

    const followersCount: Promise<void> = followCache.updateFollowCountInCache(`${followeeId}`, 'followersCount', -1);
    const followeesCount: Promise<void> = followCache.updateFollowCountInCache(`${req.currentUser!.userId}`, 'followingCount', -1);
    await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeesCount]);

    followQueue.addFollowJob('removeFollowFromDB', {
      keyOne: `${followeeId}`,
      keyTwo: `${req.currentUser!.userId}`
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}
