import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { IFollowData } from '@follows/interfaces/follow.interface';
import { FollowCache } from '@services/redis/follow.cache';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { socketIOFollowObject } from '@sockets/follow';
import { followQueue } from '@services/queues/follow.queue';

const followCache: FollowCache = new FollowCache();
const userCache: UserCache = new UserCache();

export class Add {
  public async follow(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;

    // update count in cache
    const followersCount: Promise<void> = followCache.updateFollowCountInCache(`${followeeId}`, 'followersCount', 1);
    const followeesCount: Promise<void> = followCache.updateFollowCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
    await Promise.all([followersCount, followeesCount]);

    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(followeeId) as Promise<IUserDocument>;
    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;
    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);

    const followObjectId: ObjectId = new ObjectId();
    const addFolloweeData: IFollowData = Add.prototype.userData(response[0]);

    socketIOFollowObject.emit('add follow', addFolloweeData);

    const addFollowerToCache: Promise<void> = followCache.saveFollowToCache(`following:${req.currentUser!.userId}`, `${followeeId}`);
    const addFolloweeToCache: Promise<void> = followCache.saveFollowToCache(`followers:${followeeId}`, `${req.currentUser!.userId}`);
    await Promise.all([addFollowerToCache, addFolloweeToCache]);

    followQueue.addFollowJob('addFollowToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followeeId}`,
      username: req.currentUser!.username,
      followDocumentId: followObjectId
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postsCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}
