import { IFollowData } from '@follows/interfaces/follow.interface';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import mongoose from 'mongoose';
import { remove } from 'lodash';

const cacheName: string = 'followCache';
const log: Logger = config.createLogger(cacheName);
const userCache: UserCache = new UserCache();

export class FollowCache extends BaseCache {
  constructor() {
    super(cacheName);
  }

  public async saveFollowToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LPUSH(key, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async removeFollowFromCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LREM(key, 1, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async updateFollowCountInCache(userId: string, prop: string, value: number): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.HINCRBY(`users:${userId}`, prop, value);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async getFollowsFromCache(key: string): Promise<IFollowData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: string[] = await this.client.LRANGE(key, 0, -1);
      const list: IFollowData[] = [];
      for (const item of response) {
        const user: IUserDocument = (await userCache.getUserFromCache(item)) as IUserDocument;
        const data: IFollowData = {
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
        list.push(data);
      }

      return list;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async updateBlockedUserPropInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: string = (await this.client.HGET(`users:${key}`, prop)) as string;
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      let blocked: string[] = Helpers.parseJson(response) as string[];

      if (type === 'block') {
        blocked = [...blocked, value];
      } else {
        remove(blocked, (id: string) => id === value);
      }

      multi.HSET(`users:${key}`, `${prop}`, JSON.stringify(blocked));
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }
}
