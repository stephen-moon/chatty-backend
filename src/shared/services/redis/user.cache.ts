import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import { INotificationSettings, ISocialLinks, IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';

const cacheName: string = 'userCache';
const log: Logger = config.createLogger(cacheName);
type UserItem = string | ISocialLinks | INotificationSettings;
type UserCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IUserDocument | IUserDocument[];

export class UserCache extends BaseCache {
  constructor() {
    super(cacheName);
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const dataToSave = {
      _id: `${_id}`,
      uid: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`users:${key}`, itemKey, itemValue);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.postsCount = Helpers.parseJson(`${response.postsCount}`);
      response.blocked = Helpers.parseJson(`${response.blocked}`);
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
      response.notifications = Helpers.parseJson(`${response.notifications}`);
      response.social = Helpers.parseJson(`${response.social}`);
      response.followersCount = Helpers.parseJson(`${response.followersCount}`);
      response.followingCount = Helpers.parseJson(`${response.followingCount}`);
      response.bgImageId = Helpers.parseJson(`${response.bgImageId}`);
      response.bgImageVersion = Helpers.parseJson(`${response.bgImageVersion}`);
      response.profilePicture = Helpers.parseJson(`${response.profilePicture}`);

      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async getUsersFromCache(start: number, end: number, excludedUserKey: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: string[] = await this.client.ZRANGE('user', start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const key of response) {
        if (key !== excludedUserKey) {
          multi.HGETALL(`users:${key}`);
        }
      }
      const replies: UserCacheMultiType = (await multi.exec()) as UserCacheMultiType;
      const userReplies: IUserDocument[] = [];
      for (const reply of replies as IUserDocument[]) {
        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.postsCount = Helpers.parseJson(`${reply.postsCount}`);
        reply.blocked = Helpers.parseJson(`${reply.blocked}`);
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
        reply.notifications = Helpers.parseJson(`${reply.notifications}`);
        reply.social = Helpers.parseJson(`${reply.social}`);
        reply.followersCount = Helpers.parseJson(`${reply.followersCount}`);
        reply.followingCount = Helpers.parseJson(`${reply.followingCount}`);
        reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
        reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
        reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);

        userReplies.push(reply);
      }

      return userReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async updateSingleUserItemInCache(userId: string, prop: string, value: UserItem): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.HSET(`users:${userId}`, `${prop}`, JSON.stringify(value));
      const response: IUserDocument = (await this.getUserFromCache(userId)) as IUserDocument;

      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }

  public async getTotalUsersInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const count: number = await this.client.ZCARD('user');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }
}
