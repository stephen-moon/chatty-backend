import { ServerError } from '@global/helpers/error-handler';
import { IReactionDocument, IReactions } from '@reactions/interfaces/reactions.interface';
import { config } from '@root/config';
import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';

const cacheName: string = 'reactionCache';
const log: Logger = config.createLogger(cacheName);

export class ReactionCache extends BaseCache {
  constructor() {
    super(cacheName);
  }

  public async savePostReactionToCache(
    key: string,
    reaction: IReactionDocument,
    postReactions: IReactions,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        // call remove reaction method
      }

      if (type) {
        await this.client.LPUSH(`reactions: ${key}`, JSON.stringify(reaction));
        const dataToSave: string[] = ['reactions', JSON.stringify(postReactions)];
        await this.client.HSET(`posts: ${key}`, dataToSave);
      }
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error.  Try again.');
    }
  }
}
