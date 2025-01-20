import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowCache } from '@services/redis/follow.cache';
import { PostCache } from '@services/redis/post.cache';
import { UserCache } from '@services/redis/user.cache';
import { IAllUsers, IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@services/db/user.service';
import { IFollowData } from '@follows/interfaces/follow.interface';
import { followService } from '@services/db/follow.service';
import mongoose from 'mongoose';

const PAGE_SIZE = 12;

interface IUserAll {
  newSkip: number;
  limit: number;
  skip: number;
  userId: string;
}

const postCache: PostCache = new PostCache();
const userCache: UserCache = new UserCache();
const followeCache: FollowCache = new FollowCache();

export class Get {
  public async all(req: Request, res: Response): Promise<void> {
    const { page } = req.params;
    const skip: number = (parseInt(page) - 1) * PAGE_SIZE;
    const limit: number = PAGE_SIZE * parseInt(page);
    const newSkip: number = skip === 0 ? skip : skip + 1;
    const allUsers = await Get.prototype.allUsers({
      newSkip,
      limit,
      skip,
      userId: `${req.currentUser!.userId}`
    });
    const followers: IFollowData[] = await Get.prototype.followers(`${req.currentUser!.userId}`);

    res.status(HTTP_STATUS.OK).json({ message: 'Get users', users: allUsers.users, totalUsers: allUsers.totalUsers, followers });
  }

  public async profile(req: Request, res: Response): Promise<void> {
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser!.userId}`)) as IUserDocument;
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(`${req.currentUser!.userId}`);

    res.status(HTTP_STATUS.OK).json({ message: 'Get user profile', user: existingUser });
  }

  public async profileByUserId(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(userId)) as IUserDocument;
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(userId);

    res.status(HTTP_STATUS.OK).json({ message: 'Get user profile by id', user: existingUser });
  }

  private async allUsers({ newSkip, limit, skip, userId }: IUserAll): Promise<IAllUsers> {
    let users: IUserDocument[];
    let type = '';
    const cachedUsers: IUserDocument[] = (await userCache.getUsersFromCache(newSkip, limit, userId)) as IUserDocument[];
    if (cachedUsers.length) {
      type = 'redis';
      users = cachedUsers;
    } else {
      type = 'mongodb';
      users = await userService.getAllUsers(userId, skip, limit);
    }
    const totalUsers: number = await Get.prototype.usersCount(type);
    return { users, totalUsers };
  }

  private async usersCount(type: string): Promise<number> {
    const totalUsers: number = type === 'redis' ? await userCache.getTotalUsersInCache() : await userService.getTotalUsersInDB();
    return totalUsers;
  }

  private async followers(userId: string): Promise<IFollowData[]> {
    const cachedFollowers: IFollowData[] = await followeCache.getFollowsFromCache(`followers:${userId}`);
    const result = cachedFollowers.length ? cachedFollowers : await followService.getFollowerData(new mongoose.Types.ObjectId(userId));

    return result;
  }
}
