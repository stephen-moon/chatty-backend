import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import { FollowCache } from '@services/redis/follow.cache';
import { IFollow, IFollowData } from '@follows/interfaces/follow.interface';
import { followService } from '@services/db/follow.service';

const followCache: FollowCache = new FollowCache();

export class Get {
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedFollowees: IFollowData[] = await followCache.getFollowsFromCache(`following:${req.currentUser!.userId}`);
    const following: IFollow[] | IFollowData[] = cachedFollowees.length
      ? cachedFollowees
      : await followService.getFolloweeData(userObjectId);

    res.status(HTTP_STATUS.OK).json({ message: 'User following', following });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params.userId);
    const cachedFollowers: IFollowData[] = await followCache.getFollowsFromCache(`followers:${req.params.userId}`);
    const followers: IFollow[] | IFollowData[] = cachedFollowers.length
      ? cachedFollowers
      : await followService.getFollowerData(userObjectId);

    res.status(HTTP_STATUS.OK).json({ message: 'User followers', followers });
  }
}
